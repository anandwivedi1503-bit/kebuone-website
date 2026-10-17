import { nextSeqId } from "@/lib/nextSeqId";
import { money } from "@/lib/gst";
import Refund from "@/models/Refund";

type BookingDoc = {
  bookingId?: string;
  riderId?: string;
};

/** Captured at Razorpay but not applied to the booking — queue an admin refund ticket. */
export async function queueOrphanRazorpayRefund(input: {
  booking: BookingDoc;
  amount: number;
  razorpayPaymentId: string;
  reason: string;
}) {
  const bookingId = String(input.booking.bookingId || "").trim();
  const amount = money(input.amount);
  const paymentId = String(input.razorpayPaymentId || "").trim();
  if (!bookingId || amount < 1 || !paymentId) return false;

  const existing = await Refund.findOne({
    bookingId,
    gatewayTxnId: paymentId,
    refundStatus: { $nin: ["REJECTED", "FAILED"] },
  });
  if (existing) return false;

  const refundId = await nextSeqId("RF", "refundSequence", 8);
  try {
    await Refund.create({
      refundId,
      bookingId,
      riderId: input.booking.riderId,
      amount,
      refundStatus: "PENDING",
      refundSource: "Booking Cancellation",
      paymentGateway: "Razorpay",
      gatewayTxnId: paymentId,
      remarks: `Orphan Razorpay capture ${paymentId}. ${input.reason}`.slice(0, 500),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      Number((error as { code?: unknown }).code) === 11000
    ) {
      return false;
    }
    throw error;
  }
  return true;
}
