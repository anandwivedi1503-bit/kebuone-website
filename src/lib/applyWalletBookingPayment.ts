import crypto from "crypto";
import mongoose from "mongoose";

import { CGST_RATE, SGST_RATE, getBookingPayableAmount, gstShareForPayment } from "@/lib/gst";
import { generateSixDigitOtp, pickupOtpExpiry } from "@/lib/otp";
import { writeAudit } from "@/lib/writeAudit";
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

export async function applyWalletBookingPayment(input: {
  bookingMongoId: string;
  paidAmount: number;
}) {
  const { bookingMongoId, paidAmount } = input;
  let session: mongoose.ClientSession | null = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(bookingMongoId).session(session);
    if (!booking) {
      await rollback(session);
      return { ok: false as const, status: 404, message: "Booking not found." };
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (!rider) {
      await rollback(session);
      return { ok: false as const, status: 404, message: "Rider not found." };
    }

    if (rider.currentBookingId && rider.currentBookingId !== booking.bookingId) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "Rider already has another booking." };
    }

    if (!rider.bookingEnabled) {
      await rollback(session);
      return { ok: false as const, status: 403, message: "Booking is disabled for this rider." };
    }

    if (rider.status !== "Active") {
      await rollback(session);
      return { ok: false as const, status: 403, message: "Rider account is not active." };
    }

    if (booking.paymentStatus === "Paid" || Number(booking.pendingAmount) <= 0) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "This booking has already been fully paid." };
    }

    if (
      booking.rideStatus === "Cancelled" ||
      booking.rideStatus === "Completed" ||
      booking.rideStatus === "Ready For Pickup" ||
      booking.rideStatus === "In Ride"
    ) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "This booking is no longer payable." };
    }

    const payableAmount = getBookingPayableAmount(booking);
    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(Number((payableAmount - oldReceivedAmount).toFixed(2)), 0);

    if (paidAmount < 1 || paidAmount > remainingAmount) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "Payment amount does not match booking balance." };
    }

    if (
      booking.rentalMode === "Rent To Own" &&
      Number(paidAmount.toFixed(2)) !== Number(remainingAmount.toFixed(2))
    ) {
      await rollback(session);
      return {
        ok: false as const,
        status: 400,
        message: "Rent to Own requires the full installment in one payment.",
      };
    }

    const wallet = await Wallet.findOne({
      riderId: rider.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    }).session(session);

    if (!wallet || wallet.status !== "Active" || wallet.adminBlocked) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "Wallet is not available for this rider." };
    }

    const available = Math.max(
      0,
      Number(wallet.balance || 0) - Number(wallet.freezeAmount || 0)
    );
    if (available < paidAmount) {
      await rollback(session);
      return {
        ok: false as const,
        status: 400,
        message: `Wallet balance is INR ${available.toFixed(2)}. Pay with Razorpay or recharge the wallet.`,
      };
    }

    wallet.balance = Number((Number(wallet.balance || 0) - paidAmount).toFixed(2));
    wallet.totalSpent = Number((Number(wallet.totalSpent || 0) + paidAmount).toFixed(2));
    wallet.lastDebitAt = new Date();
    await wallet.save({ session });

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
    const transactionId = generateWalletTransactionId();

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
          paymentMethod: "Wallet",
          transactionType: "Booking Payment",
          invoiceNumber,
          invoiceGenerated: true,
          status: "Success",
        },
      ],
      { session }
    );

    await WalletTransaction.create(
      [
        {
          transactionId: generateWalletTransactionId(),
          riderId: booking.riderId,
          userId: booking.userId,
          userName: booking.userName,
          amount: paidAmount,
          transactionType: "Booking Payment",
          paymentMethod: "Wallet",
          bookingId: booking.bookingId,
          balanceAfter: Number(wallet.balance || 0),
          remarks: "Booking paid from wallet.",
          status: "Success",
        },
      ],
      { session }
    );

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
            paymentMethod: "Wallet",
            bookingId: booking.bookingId,
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
      },
      {
        $set: {
          receivedAmount: newReceivedAmount,
          pendingAmount,
          paymentMode: "Wallet",
          paymentStatus,
          rideStatus,
          pickupOTP,
          pickupOTPExpiry: pendingAmount <= 0 ? pickupOtpExpiry() : null,
          pickupOTPVerified: false,
          pickupOTPVerifiedAt: null,
          paymentDate: new Date(),
          paymentVerifiedAt: new Date(),
          invoiceNumber,
          invoiceGenerated: true,
        },
      },
      { new: true, session }
    );

    if (!updatedBooking) {
      await rollback(session);
      return { ok: false as const, status: 409, message: "Booking was already paid." };
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
        ok: false as const,
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

    void writeAudit({
      actor: "Rider",
      action: "WALLET_PAYMENT",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: booking.riderId,
      bookingId: booking.bookingId,
      detail: `INR ${paidAmount} · ${paymentStatus}`,
    });

    return {
      ok: true as const,
      alreadyVerified: false,
      booking: updatedBooking.toObject(),
      paidAmount,
      pendingAmount,
      paymentStatus,
      pickupOTP: pendingAmount <= 0 ? pickupOTP : undefined,
      message:
        paymentStatus === "Paid"
          ? "Wallet payment complete. Bike is ready for pickup."
          : "Partial wallet payment applied.",
    };
  } catch (error) {
    await rollback(session);
    console.error("WALLET BOOKING PAYMENT ERROR:", error);
    return { ok: false as const, status: 500, message: "Wallet payment failed." };
  }
}
