import { money } from "@/lib/gst";
import { getRazorpayClient } from "@/lib/razorpay/config";
import { isRazorpayPaymentId } from "@/lib/razorpay/bookingRazorpayCaptures";
import Transaction from "@/models/Transaction";

export async function refundRazorpayPayment(paymentId: string, amountInr: number) {
  const razorpay = getRazorpayClient();
  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(amountInr * 100),
    speed: "normal",
    notes: {
      source: "evuddy-admin-refund",
    },
  });
  return refund;
}

/** Refund across captured Razorpay booking payments (FIFO), not only the last payment id. */
export async function refundRazorpayAmountForBooking(
  bookingId: string,
  amountInr: number,
  fallbackPaymentId?: string
) {
  const toRefund = money(amountInr);
  if (toRefund < 0.01) {
    return { refunded: 0, remaining: 0, ids: [] as string[], lastPaymentId: "" };
  }

  const payments = await Transaction.find({
    bookingId,
    paymentMethod: "Razorpay",
    status: "Success",
    transactionType: {
      $in: ["Booking Payment", "Security Deposit Hold", "Partial Payment"],
    },
  })
    .sort({ createdAt: 1 })
    .lean();

  const priorRefunded = money(
    (
      await Transaction.find({
        bookingId,
        paymentMethod: "Razorpay",
        transactionType: "Refund",
        status: "Success",
      }).lean()
    ).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  );

  let remainingPrior = priorRefunded;
  let remaining = toRefund;
  const ids: string[] = [];
  let lastPaymentId = "";

  const rows =
    payments.length > 0
      ? payments
      : fallbackPaymentId
        ? [{ amount: toRefund, razorpayPaymentId: fallbackPaymentId, transactionId: fallbackPaymentId }]
        : [];

  for (const pay of rows) {
    const payAmt = money(pay.amount);
    const skip = Math.min(payAmt, remainingPrior);
    remainingPrior = money(remainingPrior - skip);
    const available = money(payAmt - skip);
    if (available <= 0.009) continue;
    const chunk = Math.min(available, remaining);
    const paymentId = String(pay.razorpayPaymentId || pay.transactionId || "").trim();
    if (!isRazorpayPaymentId(paymentId)) continue;
    const refund = await refundRazorpayPayment(paymentId, chunk);
    const refundId = String((refund as { id?: string }).id || "");
    if (refundId) ids.push(refundId);
    lastPaymentId = paymentId;
    remaining = money(remaining - chunk);
    if (remaining <= 0.009) break;
  }

  return {
    refunded: money(toRefund - remaining),
    remaining,
    ids,
    lastPaymentId,
  };
}
