import crypto from "crypto";
import mongoose from "mongoose";

import { CGST_RATE, SGST_RATE, getBookingPayableAmount, gstShareForPayment } from "@/lib/gst";
import { generateSixDigitOtp, pickupOtpExpiry } from "@/lib/otp";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

function generateWalletTransactionId() {
  return `WTX-${crypto.randomUUID().toUpperCase()}`;
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
    const existingTransaction = await Transaction.findOne({
      transactionId: razorpayPaymentId,
    });

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

    const duplicateTransaction = await Transaction.findOne({
      transactionId: razorpayPaymentId,
    }).session(session);

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

    if (booking.paymentStatus === "Paid" || Number(booking.pendingAmount) <= 0) {
      await rollback(session);
      return { ok: false, status: 400, message: "This booking has already been fully paid." };
    }

    if (
      booking.rideStatus === "Cancelled" ||
      booking.rideStatus === "Completed" ||
      booking.rideStatus === "Ready For Pickup" ||
      booking.rideStatus === "In Ride"
    ) {
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
    const paymentStatus = pendingAmount <= 0 ? "Paid" : "Partial";
    const rideStatus = pendingAmount <= 0 ? "Ready For Pickup" : "Payment Pending";
    const pickupOTP = pendingAmount <= 0 ? generateSixDigitOtp() : "";
    const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingId}`;
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
      const [createdWallet] = await Wallet.create(
        [
          {
            riderId: rider.riderId,
            userId: rider._id,
            userName: rider.fullName,
            phone: rider.phone,
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
    }

    const existingDepositHold = await WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Hold",
    }).session(session);

    if (!existingDepositHold && pendingAmount <= 0 && Number(booking.securityDeposit || 0) > 0) {
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
          receivedAmount: newReceivedAmount,
          pendingAmount,
          paymentMode: "Razorpay",
          paymentStatus,
          rideStatus,
          pickupOTP,
          pickupOTPExpiry: pendingAmount <= 0 ? pickupOtpExpiry() : null,
          pickupOTPVerified: false,
          pickupOTPVerifiedAt: null,
          rideStartOTP: "",
          rideStartOTPExpiry: null,
          rideStartOTPVerified: false,
          rideEndOTP: "",
          rideEndOTPExpiry: null,
          rideEndOTPVerified: false,
          rideEndOTPVerifiedAt: null,
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
          vehicleStatus: pendingAmount <= 0 ? "Ready For Pickup" : "Booked",
          currentBookingId: booking.bookingId,
          currentRiderId: booking.riderId,
          assignedRider: booking.riderId,
          lockStatus: "Locked",
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

    await session.commitTransaction();
    await session.endSession();

    return {
      ok: true,
      alreadyVerified: false,
      booking: updatedBooking.toObject(),
      paidAmount,
      pendingAmount,
      paymentStatus,
      pickupOTP: pendingAmount <= 0 ? pickupOTP : undefined,
      message:
        paymentStatus === "Paid"
          ? "Payment verified. Bike is ready for pickup."
          : "Partial payment verified successfully.",
    };
  } catch (error) {
    await rollback(session);
    console.error("APPLY CAPTURED PAYMENT ERROR:", error);
    return { ok: false, status: 500, message: "Payment verification failed." };
  }
}
