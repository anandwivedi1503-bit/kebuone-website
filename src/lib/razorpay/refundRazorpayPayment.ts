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

export type RazorpayRefundDetail = {
  id: string;
  paymentId: string;
  amount: number;
  status: "pending" | "processed" | "failed";
};

/** Refund across captured Razorpay booking payments (FIFO), not only the last payment id. */
export async function refundRazorpayAmountForBooking(
  bookingId: string,
  amountInr: number,
  fallbackPaymentId?: string,
  onRefundCreated?: (refund: RazorpayRefundDetail) => Promise<void>
) {
  const toRefund = money(amountInr);
  if (toRefund < 0.01) {
    return {
      refunded: 0,
      remaining: 0,
      ids: [] as string[],
      refunds: [] as RazorpayRefundDetail[],
      lastPaymentId: "",
    };
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
  const refunds: RazorpayRefundDetail[] = [];
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
    const entity = refund as {
      id?: string;
      payment_id?: string;
      amount?: number;
      status?: string;
    };
    const refundId = String(entity.id || "").trim();
    if (!refundId) {
      throw new Error("Razorpay accepted a refund request without returning a refund ID.");
    }
    const status = String(entity.status || "pending").toLowerCase();
    const refundStatus: RazorpayRefundDetail["status"] =
      status === "processed" || status === "failed" ? status : "pending";
    const acceptedAmount = money(Number(entity.amount || Math.round(chunk * 100)) / 100);
    ids.push(refundId);
    refunds.push({
      id: refundId,
      paymentId: String(entity.payment_id || paymentId),
      amount: acceptedAmount,
      status: refundStatus,
    });
    await onRefundCreated?.(refunds[refunds.length - 1]);
    lastPaymentId = paymentId;
    if (refundStatus !== "failed") remaining = money(remaining - acceptedAmount);
    if (remaining <= 0.009) break;
  }

  return {
    refunded: money(toRefund - remaining),
    remaining,
    ids,
    refunds,
    lastPaymentId,
  };
}
