import crypto from "crypto";
import mongoose from "mongoose";
import { isMongoTransactionUnsupported } from "@/lib/mongoTransaction";

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
import { isWalletUsable, walletSpendable } from "@/lib/walletMoney";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

function generateWalletTransactionId() {
  return `WTX-${crypto.randomUUID().toUpperCase()}`;
}

async function reverseStandaloneWalletDebit(
  walletId: mongoose.Types.ObjectId,
  paidAmount: number,
  bookingId: string,
  riderId: string
) {
  const restored = await Wallet.findByIdAndUpdate(
    walletId,
    {
      $inc: { balance: paidAmount, totalSpent: -paidAmount },
    },
    { new: true }
  );
  if (!restored) return;
  try {
    await WalletTransaction.create({
      transactionId: generateWalletTransactionId(),
      riderId,
      amount: paidAmount,
      transactionType: "Refund",
      paymentMethod: "Wallet",
      transactionSource: "System",
      bookingId,
      balanceAfter: Number(restored.balance || 0),
      remarks: "Automatic reverse after a conflicting booking payment.",
      status: "Success",
    });
  } catch (error) {
    console.error("WALLET PAYMENT REVERSE LEDGER ERROR:", error);
  }
}

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;
  try {
    await session.abortTransaction();
  } catch {}
  await session.endSession();
}

export async function applyWalletBookingPayment(
  input: {
    bookingMongoId: string;
    paidAmount: number;
  },
  useTxn = true
) {
  const { bookingMongoId, paidAmount } = input;
  let session: mongoose.ClientSession | null = null;

  try {
    if (useTxn) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const booking = session
      ? await Booking.findById(bookingMongoId).session(session)
      : await Booking.findById(bookingMongoId);
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

    if (booking.rideStatus === "Cancelled") {
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
        message: "Rent to Own requires today’s full amount (₹280 + 5% GST) in one payment.",
      };
    }

    const walletQuery = Wallet.findOne({
      riderId: rider.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });
    const wallet = session ? await walletQuery.session(session) : await walletQuery;

    if (!isWalletUsable(wallet)) {
      await rollback(session);
      return { ok: false as const, status: 400, message: "Wallet is not available for this rider." };
    }

    const available = walletSpendable(wallet);
    if (available < paidAmount) {
      await rollback(session);
      return {
        ok: false as const,
        status: 400,
        message: `Wallet balance is INR ${available.toFixed(2)}. Pay with Razorpay or recharge the wallet.`,
      };
    }

    // Atomic spendable check + debit (balance - freeze >= paidAmount).
    const debited = await Wallet.findOneAndUpdate(
      {
        _id: wallet._id,
        status: "Active",
        adminBlocked: { $ne: true },
        $expr: {
          $gte: [
            {
              $subtract: [
                { $ifNull: ["$balance", 0] },
                { $ifNull: ["$freezeAmount", 0] },
              ],
            },
            paidAmount,
          ],
        },
      },
      {
        $inc: { balance: -paidAmount, totalSpent: paidAmount },
        $set: { lastDebitAt: new Date() },
      },
      { new: true, ...(session ? { session } : {}) }
    );
    if (!debited) {
      await rollback(session);
      return {
        ok: false as const,
        status: 409,
        message: "Wallet balance changed. Refresh Book EV and try again.",
      };
    }
    wallet.balance = debited.balance;
    wallet.totalSpent = debited.totalSpent;

    const newReceivedAmount = Number((oldReceivedAmount + paidAmount).toFixed(2));
    const pendingAmount = Math.max(Number((payableAmount - newReceivedAmount).toFixed(2)), 0);
    const progress = nextPaymentProgress(booking, newReceivedAmount, pendingAmount);
    const { paymentStatus, rideStatus, pickupOTP } = progress;
    const taxOnPayment = isRentToOwnBooking(booking)
      ? gstOnRtoDailyPayment(paidAmount)
      : gstShareForPayment({
          rentalAmount: booking.rateApplied || booking.totalAmount,
          gstAmount: booking.gstAmount,
          previousReceived: oldReceivedAmount,
          paidNow: paidAmount,
        });
    const transactionId = generateWalletTransactionId();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingId}-W-${transactionId.slice(-8)}`;

    const paymentTxn = {
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
      remarks:
        booking.rentalMode === "Rent To Own"
          ? `RTO daily receipt · day ${Number(booking.rtoInstallmentsPaid || 0) + 1}`
          : "Wallet booking payment",
    };
    if (session) {
      await Transaction.create([paymentTxn], { session });
    } else {
      await Transaction.create(paymentTxn);
    }

    const walletTxn = {
      transactionId: generateWalletTransactionId(),
      riderId: booking.riderId,
      userId: booking.userId,
      userName: booking.userName,
      amount: paidAmount,
      transactionType: "Booking Payment",
      paymentMethod: "Wallet",
      bookingId: booking.bookingId,
      balanceAfter: Number(wallet.balance || 0),
      remarks:
        booking.rentalMode === "Rent To Own"
          ? `RTO daily receipt · day ${Number(booking.rtoInstallmentsPaid || 0) + 1}`
          : "Booking paid from wallet.",
      status: "Success",
    };
    if (session) {
      await WalletTransaction.create([walletTxn], { session });
    } else {
      await WalletTransaction.create(walletTxn);
    }

    const holdQuery = WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Hold",
    });
    const existingDepositHold = session ? await holdQuery.session(session) : await holdQuery;

    if (!existingDepositHold && pendingAmount <= 0 && Number(booking.securityDeposit || 0) > 0) {
      wallet.securityDepositHold = Math.max(
        Number(wallet.securityDepositHold || 0),
        Number(booking.securityDeposit || 0)
      );
      await wallet.save(session ? { session } : {});
      const holdTxn = {
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
      };
      if (session) {
        await WalletTransaction.create([holdTxn], { session });
      } else {
        await WalletTransaction.create(holdTxn);
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      bookingPaymentApplyFilter(bookingMongoId, oldReceivedAmount, paidAmount),
      {
        $set: {
          ...progress.bookingPatch,
          paymentMode: "Wallet",
          paymentDate: new Date(),
          paymentVerifiedAt: new Date(),
          invoiceNumber,
          invoiceGenerated: true,
          ...rtoCycleAfterInstallment(booking, pendingAmount, newReceivedAmount),
        },
      },
      { new: true, ...(session ? { session } : {}) }
    );

    if (!updatedBooking) {
      await rollback(session);
      if (!session) {
        await reverseStandaloneWalletDebit(wallet._id, paidAmount, booking.bookingId, rider.riderId);
      }
      return {
        ok: false as const,
        status: 409,
        message: "This booking was updated by another payment. Do not charge again until Book EV refreshes.",
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
        session ? { session } : {}
      );

      if (!updatedVehicle) {
        await rollback(session);
        if (!session) {
          await reverseStandaloneWalletDebit(wallet._id, paidAmount, booking.bookingId, rider.riderId);
        }
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
        session ? { session } : {}
      );
    }

    await queueDepositRefundIfEligible(updatedBooking, session);

    if (session) {
      await session.commitTransaction();
      await session.endSession();
      session = null;
    }

    const issuedPickupOtp =
      updatedBooking.pickupOTPVerified
        ? undefined
        : pickupOTP || String(updatedBooking.pickupOTP || "") || undefined;
    const nextPending = Number(updatedBooking.pendingAmount || 0);
    const nextPaymentStatus = String(updatedBooking.paymentStatus || paymentStatus);
    const nextRideStatus = String(updatedBooking.rideStatus || rideStatus);
    const isRto = String(updatedBooking.rentalMode || "") === "Rent To Own";

    void writeAudit({
      actor: "Rider",
      action: "WALLET_PAYMENT",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: booking.riderId,
      bookingId: booking.bookingId,
      detail: `INR ${paidAmount} · ${paymentStatus}`,
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
        paymentMethod: "Wallet",
        rideEndOTP: undefined,
        invoiceNumber,
        receiptDay: Number(updatedBooking.rtoInstallmentsPaid || 0) || undefined,
        rentalMode: String(updatedBooking.rentalMode || ""),
        gstAmount: taxOnPayment.gstAmount,
      });
    } catch (notifyError) {
      console.error("WALLET PAYMENT NOTIFY ERROR:", notifyError);
    }

    return {
      ok: true as const,
      alreadyVerified: false,
      booking: updatedBooking.toObject(),
      paidAmount,
      pendingAmount: nextPending,
      paymentStatus: nextPaymentStatus,
      pickupOTP: issuedPickupOtp,
      rideEndOTP: undefined,
      message:
        isRto && Boolean(updatedBooking.ownershipTransferred)
          ? "Final daily payment received. This scooter is now yours. Thank you for riding with EVUDDY."
          : isRto
          ? "Daily Rent to Own received from wallet. Tomorrow’s ₹280 + GST opens when due."
          : nextPaymentStatus === "Paid"
          ? nextRideStatus === "In Ride"
            ? "Remaining is ₹0. Return to the yard and swipe Ride end on Book EV to get the ride-end OTP."
            : nextRideStatus === "Completed"
            ? "Wallet payment complete. Thank you for riding with EVUDDY."
            : "Wallet payment complete. Pickup OTP is ready."
          : "Partial wallet payment applied. Pickup OTP is ready. Remaining must be ₹0 before you swipe Ride end.",
    };
  } catch (error) {
    await rollback(session);
    if (useTxn && isMongoTransactionUnsupported(error)) {
      return applyWalletBookingPayment(input, false);
    }
    console.error("WALLET BOOKING PAYMENT ERROR:", error);
    return { ok: false as const, status: 500, message: "Wallet payment failed." };
  }
}
