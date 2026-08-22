import crypto from "crypto";
import mongoose from "mongoose";

import { CGST_RATE, SGST_RATE, getBookingPayableAmount, gstShareForPayment } from "@/lib/gst";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { writeAudit } from "@/lib/writeAudit";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
import {
  isBookingStillPayable,
  nextPaymentProgress,
} from "@/lib/bookingPaymentProgress";
import { queueDepositRefundIfEligible } from "@/lib/queueDepositRefund";
import { normalizeIndianPhone } from "@/lib/requestAuth";

function generateWalletTransactionId() {
  return `WTX-${crypto.randomUUID().toUpperCase()}`;
}

function razorpayIdVariants(value: string) {
  const id = String(value || "").trim();
  return Array.from(new Set([id, id.toUpperCase(), id.toLowerCase()].filter(Boolean)));
}

async function findExistingRazorpayTransaction(
  razorpayPaymentId: string,
  session?: mongoose.ClientSession | null
) {
  const ids = razorpayIdVariants(razorpayPaymentId);
  const query = {
    $or: [{ transactionId: { $in: ids } }, { razorpayPaymentId: { $in: ids } }],
  };
  return session
    ? Transaction.findOne(query).session(session)
    : Transaction.findOne(query);
}

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;
  try {
    await session.abortTransaction();
  } catch {}
  await session.endSession();
}

export type ApplyCapturedPaymentInput = {
  bookingMongoId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAmount: number;
};

export type ApplyCapturedPaymentResult =
  | {
      ok: true;
      alreadyVerified: boolean;
      booking: Record<string, unknown> | null;
      paidAmount: number;
      pendingAmount: number;
      paymentStatus: string;
      pickupOTP?: string;
      rideEndOTP?: string;
      message: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function applyCapturedRazorpayPayment(
  input: ApplyCapturedPaymentInput
): Promise<ApplyCapturedPaymentResult> {
  const { bookingMongoId, razorpayOrderId, razorpayPaymentId, paidAmount } = input;
  let session: mongoose.ClientSession | null = null;

  try {
    const existingTransaction = await findExistingRazorpayTransaction(razorpayPaymentId);

    if (existingTransaction) {
      const booking = await Booking.findById(bookingMongoId).lean();
      return {
        ok: true,
        alreadyVerified: true,
        booking: booking as Record<string, unknown> | null,
        paidAmount: Number(existingTransaction.amount || paidAmount),
        pendingAmount: Number((booking as { pendingAmount?: number } | null)?.pendingAmount || 0),
        paymentStatus: String((booking as { paymentStatus?: string } | null)?.paymentStatus || "Paid"),
        message: "Payment already verified.",
      };
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(bookingMongoId).session(session);

    if (!booking) {
      await rollback(session);
      return { ok: false, status: 404, message: "Booking not found." };
    }

    if (booking.razorpayOrderId !== razorpayOrderId) {
      await rollback(session);
      return { ok: false, status: 400, message: "Booking payment order mismatch." };
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (!rider) {
      await rollback(session);
      return { ok: false, status: 404, message: "Rider not found." };
    }

    const duplicateTransaction = await findExistingRazorpayTransaction(
      razorpayPaymentId,
      session
    );

    if (duplicateTransaction) {
      await session.commitTransaction();
      await session.endSession();
      return {
        ok: true,
        alreadyVerified: true,
        booking: booking.toObject(),
        paidAmount: Number(duplicateTransaction.amount || paidAmount),
        pendingAmount: Number(booking.pendingAmount || 0),
        paymentStatus: String(booking.paymentStatus || "Paid"),
        message: "Payment already verified.",
      };
    }

    if (rider.currentBookingId && rider.currentBookingId !== booking.bookingId) {
      await rollback(session);
      return { ok: false, status: 400, message: "Rider already has another booking." };
    }

    if (!rider.bookingEnabled) {
      await rollback(session);
      return { ok: false, status: 403, message: "Booking is disabled for this rider." };
    }

    if (rider.status !== "Active") {
      await rollback(session);
      return { ok: false, status: 403, message: "Rider account is not active." };
    }

    if (!isBookingStillPayable(booking)) {
      await rollback(session);
      return { ok: false, status: 400, message: "This booking has already been fully paid." };
    }

    if (booking.rideStatus === "Cancelled") {
      await rollback(session);
      return { ok: false, status: 400, message: "This booking is no longer payable." };
    }

    const payableAmount = getBookingPayableAmount(booking);
    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(Number((payableAmount - oldReceivedAmount).toFixed(2)), 0);

    if (paidAmount < 1 || paidAmount > remainingAmount) {
      await rollback(session);
      return { ok: false, status: 400, message: "Payment amount does not match booking balance." };
    }

    if (
      booking.rentalMode === "Rent To Own" &&
      Number(paidAmount.toFixed(2)) !== Number(remainingAmount.toFixed(2))
    ) {
      await rollback(session);
      return {
        ok: false,
        status: 400,
        message: "Rent to Own requires the full installment in one payment.",
      };
    }

    const newReceivedAmount = Number((oldReceivedAmount + paidAmount).toFixed(2));
    const pendingAmount = Math.max(Number((payableAmount - newReceivedAmount).toFixed(2)), 0);
    const progress = nextPaymentProgress(booking, newReceivedAmount, pendingAmount);
    const { paymentStatus, rideStatus, pickupOTP, rideEndOTP } = progress;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingId}-${razorpayIdVariants(razorpayPaymentId)[0].slice(-8)}`;
    const taxOnPayment = gstShareForPayment({
      rentalAmount: booking.rateApplied || booking.totalAmount,
      gstAmount: booking.gstAmount,
      previousReceived: oldReceivedAmount,
      paidNow: paidAmount,
    });

    await Transaction.create(
      [
        {
          transactionId: razorpayPaymentId,
          bookingId: booking.bookingId,
          userId: String(booking.userId || booking.userPhone || "Rider"),
          userName: booking.userName || "Rider",
          amount: paidAmount,
          gstAmount: taxOnPayment.gstAmount,
          cgstAmount: taxOnPayment.cgstAmount,
          sgstAmount: taxOnPayment.sgstAmount,
          cgstRate: CGST_RATE,
          sgstRate: SGST_RATE,
          paymentMethod: "Razorpay",
          razorpayOrderId,
          razorpayPaymentId,
          transactionType: "Booking Payment",
          invoiceNumber,
          invoiceGenerated: true,
          status: "Success",
        },
      ],
      { session }
    );

    let wallet = await Wallet.findOne({
      riderId: rider.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (!wallet) {
      const walletPhone = normalizeIndianPhone(rider.phone);
      if (/^[6-9]\d{9}$/.test(walletPhone)) {
        try {
          const [createdWallet] = await Wallet.create(
            [
              {
                riderId: rider.riderId,
                userId: rider._id,
                userName: rider.fullName,
                phone: walletPhone,
                balance: 0,
                securityDepositHold: 0,
                freezeAmount: 0,
                totalRecharge: 0,
                totalSpent: 0,
                totalRefund: 0,
                status: rider.bookingEnabled ? "Active" : "Blocked",
                adminBlocked: false,
                isDeleted: false,
                updatedBy: "System",
              },
            ],
            { session }
          );
          wallet = createdWallet;
        } catch (walletError) {
          console.error("WALLET CREATE DURING RAZORPAY CAPTURE:", walletError);
          wallet = await Wallet.findOne({ riderId: rider.riderId }).session(session);
        }
      }
    }

    const existingDepositHold = await WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Hold",
    }).session(session);

    if (
      wallet &&
      !existingDepositHold &&
      pendingAmount <= 0 &&
      Number(booking.securityDeposit || 0) > 0
    ) {
      wallet.securityDepositHold = Math.max(
        Number(wallet.securityDepositHold || 0),
        Number(booking.securityDeposit || 0)
      );
      await wallet.save({ session });
      await WalletTransaction.create(
        [
          {
            transactionId: generateWalletTransactionId(),
            riderId: booking.riderId,
            userId: booking.userId,
            userName: booking.userName,
            amount: Number(booking.securityDeposit || 0),
            transactionType: "Security Deposit Hold",
            paymentMethod: "Razorpay",
            bookingId: booking.bookingId,
            razorpayOrderId,
            razorpayPaymentId,
            balanceAfter: Number(wallet.balance || 0),
            remarks: "Security deposit held for bike booking.",
            status: "Success",
          },
        ],
        { session }
      );
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingMongoId,
        paymentStatus: { $ne: "Paid" },
        razorpayOrderId,
      },
      {
        $set: {
          ...progress.bookingPatch,
          paymentMode: "Razorpay",
          paymentDate: new Date(),
          paymentVerifiedAt: new Date(),
          invoiceNumber,
          invoiceGenerated: true,
          razorpayOrderId,
          razorpayPaymentId,
          ...(booking.rentalMode === "Rent To Own" && pendingAmount <= 0
            ? {
                rtoInstallmentsPaid: Number(booking.rtoInstallmentsPaid || 0) + 1,
                rentToOwnCompletedDays: Number(booking.rentToOwnCompletedDays || 0) + 30,
                remainingRentToOwnDays: Math.max(
                  0,
                  Number(booking.remainingRentToOwnDays || 0) - 30
                ),
              }
            : {}),
          remarks: `${booking.remarks || ""}

Payment Verified
Amount : INR ${paidAmount}
Order : ${razorpayOrderId}
Payment : ${razorpayPaymentId}
Verified : ${new Date().toLocaleString("en-IN")}
`,
        },
      },
      { new: true, session }
    );

    if (!updatedBooking) {
      const latestBooking = await Booking.findById(bookingMongoId).session(session);
      await session.commitTransaction();
      await session.endSession();
      return {
        ok: true,
        alreadyVerified: true,
        booking: latestBooking?.toObject() || null,
        paidAmount,
        pendingAmount: Number(latestBooking?.pendingAmount || 0),
        paymentStatus: String(latestBooking?.paymentStatus || "Paid"),
        message: "Payment already verified.",
      };
    }

    if (progress.updateVehicle && progress.vehicleStatus) {
      const updatedVehicle = await Vehicle.findOneAndUpdate(
        {
          vehicleId: booking.vehicleId,
          $or: [
            { currentBookingId: "" },
            { currentBookingId: booking.bookingId },
            { currentBookingId: null },
          ],
        },
        {
          $set: {
            vehicleStatus: progress.vehicleStatus,
            currentBookingId: booking.bookingId,
            currentRiderId: booking.riderId,
            assignedRider: booking.riderId,
            lockStatus: progress.vehicleLockStatus,
          },
        },
        { session }
      );

      if (!updatedVehicle) {
        await rollback(session);
        return {
          ok: false,
          status: 409,
          message: "Vehicle has already been assigned to another booking.",
        };
      }
    }

    if (progress.updateRiderLock) {
      await Rider.findOneAndUpdate(
        { riderId: booking.riderId },
        {
          $set: {
            activeRide: false,
            currentBookingId: booking.bookingId,
          },
        },
        { session }
      );
    }

    await queueDepositRefundIfEligible(updatedBooking, session);

    await session.commitTransaction();
    await session.endSession();
    session = null;

    const issuedPickupOtp =
      updatedBooking.pickupOTPVerified
        ? undefined
        : pickupOTP || String(updatedBooking.pickupOTP || "") || undefined;

    void writeAudit({
      actor: "System",
      action: "RAZORPAY_CAPTURED",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: booking.riderId,
      bookingId: booking.bookingId,
      detail: `INR ${paidAmount} · ${paymentStatus} · ${razorpayPaymentId}`,
    });

    try {
      await notifyBookingPayment({
        bookingId: booking.bookingId,
        riderName: String(booking.userName || ""),
        riderPhone: String(booking.userPhone || rider.phone || ""),
        riderEmail: String(booking.userEmail || ""),
        amount: paidAmount,
        pendingAmount,
        paymentStatus,
        pickupOTP: issuedPickupOtp,
        paymentMethod: "Razorpay",
        rideEndOTP: pendingAmount <= 0 ? rideEndOTP : undefined,
      });
    } catch (notifyError) {
      console.error("BOOKING PAYMENT NOTIFY ERROR:", notifyError);
    }

    return {
      ok: true,
      alreadyVerified: false,
      booking: updatedBooking.toObject(),
      paidAmount,
      pendingAmount,
      paymentStatus,
      pickupOTP: issuedPickupOtp,
      rideEndOTP: pendingAmount <= 0 ? rideEndOTP : undefined,
      message:
        paymentStatus === "Paid"
          ? rideStatus === "In Ride"
            ? "Remaining payment received. Ride end OTP is ready on Book EV."
            : rideStatus === "Completed"
            ? "Remaining payment received."
            : "Payment verified. Pickup OTP is ready."
          : "Partial payment verified. Pickup OTP is ready. Remaining must be paid before ride end OTP is issued.",
    };
  } catch (error) {
    await rollback(session);
    console.error("APPLY CAPTURED PAYMENT ERROR:", error);
    return { ok: false, status: 500, message: "Payment verification failed." };
  }
}
