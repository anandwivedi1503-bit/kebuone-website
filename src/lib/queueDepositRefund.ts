import type mongoose from "mongoose";

import { nextSeqId } from "@/lib/nextSeqId";
import Refund from "@/models/Refund";

/** Ticket/cancel refunds do not block deposit queue; legacy deposit rows still match. */
export function existingDepositRefundFilter(bookingId: string) {
  return {
    bookingId,
    refundStatus: { $nin: ["REJECTED", "FAILED"] },
    $or: [
      { refundSource: "Security Deposit" },
      { remarks: /security deposit/i },
    ],
  };
}

type BookingDoc = {
  bookingId: string;
  riderId?: string;
  rideStatus?: string;
  pendingAmount?: number;
  securityDeposit?: number;
  refundAmount?: number;
  securityDepositRefunded?: boolean;
  save?: (opts?: { session?: mongoose.ClientSession }) => Promise<unknown>;
};

export async function queueDepositRefundIfEligible(
  booking: BookingDoc,
  session?: mongoose.ClientSession | null
) {
  if (String(booking.rideStatus || "") !== "Completed") {
    return false;
  }
  if (Number(booking.pendingAmount || 0) > 0) {
    return false;
  }
  if (Number(booking.securityDeposit || 0) <= 0) {
    return false;
  }

  const existingFilter = existingDepositRefundFilter(booking.bookingId);
  const existingRefund = session
    ? await Refund.findOne(existingFilter).session(session)
    : await Refund.findOne(existingFilter);

  if (existingRefund) {
    return false;
  }

  const refundId = await nextSeqId("RF", "refundSequence", 8, session);

  if (session) {
    await Refund.create(
      [
        {
          refundId,
          bookingId: booking.bookingId,
          riderId: booking.riderId,
          amount: booking.securityDeposit,
          refundStatus: "PENDING",
          refundSource: "Security Deposit",
          remarks: "Security deposit refund pending admin approval",
        },
      ],
      { session }
    );
  } else {
    await Refund.create({
      refundId,
      bookingId: booking.bookingId,
      riderId: booking.riderId,
      amount: booking.securityDeposit,
      refundStatus: "PENDING",
      refundSource: "Security Deposit",
      remarks: "Security deposit refund pending admin approval",
    });
  }
  booking.refundAmount = Number(booking.securityDeposit || 0);
  booking.securityDepositRefunded = false;
  if (typeof booking.save === "function") {
    await booking.save(session ? { session } : {});
  }
  return true;
}
