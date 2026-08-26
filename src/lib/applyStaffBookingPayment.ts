import crypto from "crypto";
import mongoose from "mongoose";

import { CGST_RATE, SGST_RATE, getBookingPayableAmount, gstShareForPayment } from "@/lib/gst";
import { writeAudit } from "@/lib/writeAudit";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
import { findBookingRider, syncBookingRiderId } from "@/lib/findBookingRider";
import {
  bookingPaymentApplyFilter,
  isBookingStillPayable,
  nextPaymentProgress,
} from "@/lib/bookingPaymentProgress";
import { queueDepositRefundIfEligible } from "@/lib/queueDepositRefund";
import {
  gstOnRtoDailyPayment,
  isRentToOwnBooking,
  openDueRtoInstallment,
  rtoCycleAfterInstallment,
} from "@/lib/rtoInstallmentCycle";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

function generateCashTransactionId() {
  return `CASH-${crypto.randomUUID().toUpperCase()}`;
}

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

export async function applyStaffBookingPayment(input: {
  bookingId: string;
  paidAmount: number;
  collectedBy: string;
  notes?: string;
}) {
  const bookingId = String(input.bookingId || "").trim().toUpperCase();
  const paidAmount = Number(Number(input.paidAmount).toFixed(2));
  const collectedBy = String(input.collectedBy || "yard").trim().slice(0, 80) || "yard";
  const notes = String(input.notes || "").trim().slice(0, 200);
  let session: mongoose.ClientSession | null = null;

  if (!bookingId) {
    return { ok: false as const, status: 400, message: "Booking ID is required." };
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 1) {
    return { ok: false as const, status: 400, message: "Cash amount must be at least ₹1." };
  }

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne({
      bookingId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (!booking) {
      await rollback(session);
      return { ok: false as const, status: 404, message: "Booking not found." };
    }

    const rider = await findBookingRider(booking, session);

    if (!rider) {
      await rollback(session);
      return { ok: false as const, status: 404, message: "Rider not found." };
    }
    syncBookingRiderId(booking, rider);

    if (String(booking.rideStatus || "") === "Cancelled") {
      await rollback(session);
      return { ok: false as const, status: 400, message: "This booking is no longer payable." };
    }

    await openDueRtoInstallment(booking);

    if (!isBookingStillPayable(booking)) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "This booking has already been fully paid." };
    }

    const payableAmount = getBookingPayableAmount(booking);
    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(Number((payableAmount - oldReceivedAmount).toFixed(2)), 0);

    if (paidAmount > remainingAmount) {
      await rollback(session);
      return {
        ok: false as const,
        status: 400,
        message: `Cash cannot exceed remaining ₹${remainingAmount.toFixed(2)}.`,
      };
    }

    if (
      booking.rentalMode === "Rent To Own" &&
      Number(paidAmount.toFixed(2)) !== Number(remainingAmount.toFixed(2))
    ) {
      await rollback(session);
      return {
        ok: false as const,
        status: 400,
        message: "Rent to Own requires today’s full amount (₹280 + 5% GST) in one payment.",
      };
    }

    const newReceivedAmount = Number((oldReceivedAmount + paidAmount).toFixed(2));
    const pendingAmount = Math.max(Number((payableAmount - newReceivedAmount).toFixed(2)), 0);
    const progress = nextPaymentProgress(booking, newReceivedAmount, pendingAmount);
    const { paymentStatus, pickupOTP } = progress;
    const transactionId = generateCashTransactionId();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingId}-CASH-${transactionId.slice(-8)}`;
    const taxOnPayment = isRentToOwnBooking(booking)
      ? gstOnRtoDailyPayment(paidAmount)
      : gstShareForPayment({
          rentalAmount: booking.rateApplied || booking.totalAmount,
          gstAmount: booking.gstAmount,
          previousReceived: oldReceivedAmount,
          paidNow: paidAmount,
        });

    await Transaction.create(
      [
        {
          transactionId,
          bookingId: booking.bookingId,
          userId: String(booking.userId || booking.userPhone || "Rider"),
          userName: booking.userName || "Rider",
          amount: paidAmount,
          gstAmount: taxOnPayment.gstAmount,
          cgstAmount: taxOnPayment.cgstAmount,
          sgstAmount: taxOnPayment.sgstAmount,
          cgstRate: CGST_RATE,
          sgstRate: SGST_RATE,
          paymentMethod: "Cash",
          transactionSource: "Admin Panel",
          transactionType: "Booking Payment",
          invoiceNumber,
          invoiceGenerated: true,
          status: "Success",
          remarks: (notes
            ? notes
            : booking.rentalMode === "Rent To Own"
              ? `RTO daily receipt · day ${Number(booking.rtoInstallmentsPaid || 0) + 1} · cash at yard by ${collectedBy}`
              : `Cash collected at yard by ${collectedBy}`
          ).slice(0, 500),
          collectedBy,
          collectedAt: new Date(),
          cashHandoverStatus: "DueToCompany",
          updatedBy: collectedBy,
        },
      ],
      { session }
    );

    const wallet = await Wallet.findOne({
      riderId: rider.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (wallet && pendingAmount <= 0 && Number(booking.securityDeposit || 0) > 0) {
      const existingDepositHold = await WalletTransaction.findOne({
        bookingId: booking.bookingId,
        transactionType: "Security Deposit Hold",
      }).session(session);

      if (!existingDepositHold) {
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
              paymentMethod: "Cash",
              bookingId: booking.bookingId,
              balanceAfter: Number(wallet.balance || 0),
              remarks: "Security deposit held after cash collection.",
              status: "Success",
            },
          ],
          { session }
        );
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      bookingPaymentApplyFilter(booking._id, oldReceivedAmount, paidAmount),
      {
        $set: {
          ...progress.bookingPatch,
          paymentMode: "Cash",
          paymentDate: new Date(),
          paymentVerifiedAt: new Date(),
          invoiceNumber,
          invoiceGenerated: true,
          ...rtoCycleAfterInstallment(booking, pendingAmount, newReceivedAmount),
        },
      },
      { new: true, session }
    );

    if (!updatedBooking) {
      await rollback(session);
      return { ok: false as const, status: 409, message: "Booking was already paid or updated." };
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
          ok: false as const,
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

    const nextPending = Number(updatedBooking.pendingAmount || 0);
    const nextPaymentStatus = String(updatedBooking.paymentStatus || paymentStatus);
    const issuedPickupOtp =
      updatedBooking.pickupOTPVerified
        ? undefined
        : pickupOTP || String(updatedBooking.pickupOTP || "") || undefined;

    void writeAudit({
      actor: collectedBy,
      action: "CASH_PAYMENT",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: booking.riderId,
      bookingId: booking.bookingId,
      detail: `INR ${paidAmount} · ${paymentStatus} · due to company`,
    });

    try {
      await notifyBookingPayment({
        bookingId: booking.bookingId,
        riderName: String(booking.userName || ""),
        riderPhone: String(booking.userPhone || rider.phone || ""),
        riderEmail: String(booking.userEmail || ""),
        amount: paidAmount,
        pendingAmount: nextPending,
        paymentStatus: nextPaymentStatus,
        pickupOTP: issuedPickupOtp,
        paymentMethod: "Cash",
        rideEndOTP: undefined,
        invoiceNumber,
        receiptDay: Number(updatedBooking.rtoInstallmentsPaid || 0) || undefined,
        rentalMode: String(updatedBooking.rentalMode || ""),
        gstAmount: taxOnPayment.gstAmount,
      });
    } catch (notifyError) {
      console.error("CASH PAYMENT NOTIFY ERROR:", notifyError);
    }

    return {
      ok: true as const,
      transactionId,
      receivedAmount: Number(updatedBooking.receivedAmount || 0),
      pendingAmount: nextPending,
      paymentStatus: nextPaymentStatus,
      cashHandoverStatus: "DueToCompany" as const,
      pickupOTP: issuedPickupOtp,
      message:
        isRentToOwnBooking(updatedBooking)
          ? `Rent to Own daily receipt recorded. Yard must handover this cash to the company.`
          : nextPaymentStatus === "Paid"
          ? "Cash received. Pending is ₹0. Yard must handover this cash to the company."
          : `Cash received. Remaining ₹${nextPending.toFixed(2)}. Yard must handover collected cash to the company.`,
    };
  } catch (error) {
    await rollback(session);
    console.error("CASH BOOKING PAYMENT ERROR:", error);
    return { ok: false as const, status: 500, message: "Cash payment failed." };
  }
}
