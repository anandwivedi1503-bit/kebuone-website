import { CGST_RATE, SGST_RATE, getBookingPayableAmount, gstShareForPayment } from "@/lib/gst";
import { appendBoundedText } from "@/lib/listQuery";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { writeAudit } from "@/lib/writeAudit";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
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
import { findBookingRider, syncBookingRiderId } from "@/lib/findBookingRider";
import { normalizeIndianPhone } from "@/lib/requestAuth";
import { nextSeqId } from "@/lib/nextSeqId";
import { runMongoTransaction } from "@/lib/mongoTransaction";

function razorpayIdVariants(value: string) {
  const id = String(value || "").trim();
  return Array.from(new Set([id, id.toUpperCase(), id.toLowerCase()].filter(Boolean)));
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    Number((error as { code?: unknown }).code) === 11000
  );
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 180);
  }
  return "Payment verification failed.";
}

async function findExistingRazorpayTransaction(razorpayPaymentId: string) {
  const ids = razorpayIdVariants(razorpayPaymentId);
  return Transaction.findOne({
    $or: [{ transactionId: { $in: ids } }, { razorpayPaymentId: { $in: ids } }],
  });
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

  try {
    const booking = await Booking.findById(bookingMongoId);
    if (!booking) {
      return { ok: false, status: 404, message: "Booking not found." };
    }

    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpayOrderId) {
      return { ok: false, status: 400, message: "Booking payment order mismatch." };
    }

    const rider = await findBookingRider(booking);
    if (!rider) {
      return { ok: false, status: 404, message: "Rider not found." };
    }
    syncBookingRiderId(booking, rider);

    const paymentIds = razorpayIdVariants(razorpayPaymentId);
    const alreadyOnBooking = paymentIds.includes(String(booking.razorpayPaymentId || ""));

    if (alreadyOnBooking) {
      return {
        ok: true,
        alreadyVerified: true,
        booking: booking.toObject(),
        paidAmount: Number(booking.receivedAmount || paidAmount),
        pendingAmount: Number(booking.pendingAmount || 0),
        paymentStatus: String(booking.paymentStatus || "Paid"),
        pickupOTP: String(booking.pickupOTP || "") || undefined,
        rideEndOTP: String(booking.rideEndOTP || "") || undefined,
        message: "Payment already verified.",
      };
    }

    const existingTransaction = await findExistingRazorpayTransaction(razorpayPaymentId);

    if (rider.currentBookingId) {
      const current = String(rider.currentBookingId).trim().toUpperCase();
      const thisBooking = String(booking.bookingId).trim().toUpperCase();
      if (current && thisBooking && current !== thisBooking) {
        return { ok: false, status: 400, message: "Rider already has another booking." };
      }
    }

    if (!rider.bookingEnabled) {
      return { ok: false, status: 403, message: "Booking is disabled for this rider." };
    }

    if (rider.status !== "Active") {
      return { ok: false, status: 403, message: "Rider account is not active." };
    }

    if (booking.rideStatus === "Cancelled") {
      return { ok: false, status: 400, message: "This booking is no longer payable." };
    }

    await openDueRtoInstallment(booking);

    if (!isBookingStillPayable(booking) && existingTransaction) {
      return {
        ok: true,
        alreadyVerified: true,
        booking: booking.toObject(),
        paidAmount: Number(existingTransaction.amount || paidAmount),
        pendingAmount: Number(booking.pendingAmount || 0),
        paymentStatus: String(booking.paymentStatus || "Paid"),
        message: "Payment already verified.",
      };
    }

    if (!isBookingStillPayable(booking)) {
      return { ok: false, status: 400, message: "This booking has already been fully paid." };
    }

    const payableAmount = getBookingPayableAmount(booking);
    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(Number((payableAmount - oldReceivedAmount).toFixed(2)), 0);

    if (paidAmount < 1 || paidAmount > remainingAmount) {
      return {
        ok: false,
        status: 400,
        message: "Payment amount does not match booking balance.",
      };
    }

    if (
      booking.rentalMode === "Rent To Own" &&
      Number(paidAmount.toFixed(2)) !== Number(remainingAmount.toFixed(2))
    ) {
      return {
        ok: false,
        status: 400,
        message: "Rent to Own requires today’s full amount (₹280 + 5% GST) in one payment.",
      };
    }

    const newReceivedAmount = Number((oldReceivedAmount + paidAmount).toFixed(2));
    const pendingAmount = Math.max(Number((payableAmount - newReceivedAmount).toFixed(2)), 0);
    const progress = nextPaymentProgress(booking, newReceivedAmount, pendingAmount);
    const { paymentStatus, rideStatus, pickupOTP } = progress;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${booking.bookingId}-${paymentIds[0].slice(-8)}`;
    const taxOnPayment = isRentToOwnBooking(booking)
      ? gstOnRtoDailyPayment(paidAmount)
      : gstShareForPayment({
          rentalAmount: booking.rateApplied || booking.totalAmount,
          gstAmount: booking.gstAmount,
          previousReceived: oldReceivedAmount,
          paidNow: paidAmount,
        });

    // Atomic money ledger + booking balance (OTP-on-partial stays via nextPaymentProgress).
    let updatedBooking: typeof booking | null = null;
    try {
      updatedBooking = await runMongoTransaction(async (mongoSession) => {
        const sessionOpt = mongoSession ? { session: mongoSession } : {};
        if (!existingTransaction) {
          try {
            const row = {
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
              remarks:
                booking.rentalMode === "Rent To Own"
                  ? `RTO daily receipt · day ${Number(booking.rtoInstallmentsPaid || 0) + 1}`
                  : "",
            };
            if (mongoSession) {
              await Transaction.create([row], { session: mongoSession });
            } else {
              await Transaction.create(row);
            }
          } catch (error) {
            if (!isDuplicateKeyError(error)) throw error;
          }
        }

        const nextBooking = await Booking.findOneAndUpdate(
          bookingPaymentApplyFilter(bookingMongoId, oldReceivedAmount, paidAmount),
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
              remarks: appendBoundedText(
                booking.remarks,
                `Payment verified INR ${paidAmount} ${razorpayPaymentId}`,
                500
              ),
              ...rtoCycleAfterInstallment(booking, pendingAmount, newReceivedAmount),
            },
          },
          { new: true, ...sessionOpt }
        );

        if (!nextBooking) {
          const conflict = new Error("BOOKING_PAYMENT_CONFLICT");
          (conflict as Error & { code?: string }).code = "BOOKING_PAYMENT_CONFLICT";
          throw conflict;
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
            sessionOpt
          );
          if (!updatedVehicle) {
            const conflict = new Error("BOOKING_PAYMENT_CONFLICT");
            (conflict as Error & { code?: string }).code = "BOOKING_PAYMENT_CONFLICT";
            throw conflict;
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
            sessionOpt
          );
        }

        return nextBooking as typeof booking;
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error &&
        "code" in error &&
        (error as { code?: string }).code === "BOOKING_PAYMENT_CONFLICT"
      ) {
        return {
          ok: false,
          status: 409,
          message:
            "This booking was updated by another payment. Do not charge again until Book EV refreshes.",
        };
      }
      throw error;
    }

    if (!updatedBooking) {
      return {
        ok: false,
        status: 409,
        message:
          "This booking was updated by another payment. Do not charge again until Book EV refreshes.",
      };
    }

    try {
      let wallet = await Wallet.findOne({
        riderId: rider.riderId,
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      });
      const walletPhone = normalizeIndianPhone(rider.phone);
      if (!wallet && /^[6-9]\d{9}$/.test(walletPhone)) {
        try {
          wallet = await Wallet.create({
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
          });
        } catch (walletError) {
          if (!isDuplicateKeyError(walletError)) {
            console.error("WALLET CREATE AFTER RAZORPAY CAPTURE:", walletError);
          }
          wallet = await Wallet.findOne({ riderId: rider.riderId });
        }
      }

      const existingDepositHold = await WalletTransaction.findOne({
        bookingId: booking.bookingId,
        transactionType: "Security Deposit Hold",
      });

      if (
        wallet &&
        !existingDepositHold &&
        pendingAmount <= 0 &&
        Number(booking.securityDeposit || 0) > 0
      ) {
        const holdAmount = Number(booking.securityDeposit || 0);
        const held = await Wallet.findOneAndUpdate(
          { _id: wallet._id },
          [
            {
              $set: {
                securityDepositHold: {
                  $max: [{ $ifNull: ["$securityDepositHold", 0] }, holdAmount],
                },
              },
            },
          ],
          { new: true }
        );
        await WalletTransaction.create({
          transactionId: await nextSeqId("WTX", "walletTxnSequence", 10),
          riderId: booking.riderId,
          userId: rider._id,
          userName: booking.userName,
          amount: holdAmount,
          transactionType: "Security Deposit Hold",
          paymentMethod: "Razorpay",
          bookingId: booking.bookingId,
          razorpayOrderId,
          razorpayPaymentId,
          balanceAfter: Number(held?.balance || wallet.balance || 0),
          remarks: "Security deposit held for bike booking.",
          status: "Success",
        });
      }
    } catch (error) {
      console.error("WALLET UPDATE AFTER RAZORPAY CAPTURE:", error);
    }

    try {
      await queueDepositRefundIfEligible(updatedBooking);
    } catch (error) {
      console.error("DEPOSIT REFUND QUEUE AFTER RAZORPAY CAPTURE:", error);
    }

    const nextPending = Number(updatedBooking.pendingAmount || 0);
    const nextPaymentStatus = String(updatedBooking.paymentStatus || paymentStatus);
    const nextRideStatus = String(updatedBooking.rideStatus || rideStatus);
    const isRto = String(updatedBooking.rentalMode || "") === "Rent To Own";

    const issuedPickupOtp = updatedBooking.pickupOTPVerified
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
        pendingAmount: nextPending,
        paymentStatus: nextPaymentStatus,
        pickupOTP: issuedPickupOtp,
        paymentMethod: "Razorpay",
        rideEndOTP: undefined,
        invoiceNumber,
        receiptDay: Number(updatedBooking.rtoInstallmentsPaid || 0) || undefined,
        rentalMode: String(updatedBooking.rentalMode || ""),
        gstAmount: taxOnPayment.gstAmount,
      });
    } catch (notifyError) {
      console.error("BOOKING PAYMENT NOTIFY ERROR:", notifyError);
    }

    return {
      ok: true,
      alreadyVerified: Boolean(existingTransaction),
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
          ? "Daily Rent to Own received. Pickup OTP is ready if you have not collected yet. Tomorrow’s ₹280 + GST opens when due. Keep the scooter."
          : nextPaymentStatus === "Paid"
          ? nextRideStatus === "In Ride"
            ? "Remaining is ₹0. Return to the yard and swipe Ride end on Book EV — that generates the ride-end OTP the same way pickup OTP appeared after first payment."
            : nextRideStatus === "Completed"
            ? "Payment complete. Thank you for riding with EVUDDY."
            : "Payment verified. Pickup OTP is ready."
          : "Partial payment verified. Pickup OTP is ready. Remaining must be ₹0 before you swipe Ride end.",
    };
  } catch (error) {
    console.error("APPLY CAPTURED PAYMENT ERROR:", error);
    return { ok: false, status: 500, message: errorMessage(error) };
  }
}
