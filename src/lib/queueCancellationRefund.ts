import type mongoose from "mongoose";

import { nextSeqId } from "@/lib/nextSeqId";
import Refund from "@/models/Refund";

export function existingCancellationRefundFilter(bookingId: string) {
  return {
    bookingId,
    refundSource: "Booking Cancellation",
    refundStatus: { $nin: ["REJECTED", "FAILED"] },
  };
}

type BookingDoc = {
  bookingId: string;
  riderId?: string;
  receivedAmount?: number;
  refundAmount?: number;
  save?: (opts?: { session?: mongoose.ClientSession }) => Promise<unknown>;
};

/** Queue a rental-payment refund ticket after cancel. Does not send money. */
export async function queueCancellationRefundIfPaid(
  booking: BookingDoc,
  session?: mongoose.ClientSession | null
) {
  const amount = Number(booking.receivedAmount || 0);
  if (amount <= 0.009 || !booking.bookingId) return false;

  const existingFilter = existingCancellationRefundFilter(booking.bookingId);
  const existingRefund = session
    ? await Refund.findOne(existingFilter).session(session)
    : await Refund.findOne(existingFilter);
  if (existingRefund) return false;

  const refundId = await nextSeqId("RF", "refundSequence", 8, session);
  const row = {
    refundId,
    bookingId: booking.bookingId,
    riderId: booking.riderId,
    amount,
    refundStatus: "PENDING",
    refundSource: "Booking Cancellation",
    remarks: "Rental payment refund pending admin approval after cancellation",
  };

  if (session) {
    await Refund.create([row], { session });
  } else {
    await Refund.create(row);
  }

  booking.refundAmount = amount;
  if (typeof booking.save === "function") {
    await booking.save(session ? { session } : {});
  }
  return true;
}
