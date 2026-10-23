import Transaction from "@/models/Transaction";

export function isRazorpayPaymentId(value: unknown) {
  return /^pay_[A-Za-z0-9]+$/.test(String(value || "").trim());
}

export async function listBookingRazorpayPaymentIds(
  bookingId: string,
  fallbackPaymentId?: string
) {
  const rows = await Transaction.find({
    bookingId,
    paymentMethod: "Razorpay",
    transactionType: "Booking Payment",
    status: "Success",
  })
    .select("razorpayPaymentId transactionId")
    .lean();

  const ids = new Set<string>();
  for (const row of rows) {
    for (const candidate of [row.razorpayPaymentId, row.transactionId]) {
      if (isRazorpayPaymentId(candidate)) ids.add(String(candidate).trim());
    }
  }
  if (isRazorpayPaymentId(fallbackPaymentId)) {
    ids.add(String(fallbackPaymentId).trim());
  }
  return [...ids];
}

export function razorpayRefundHasNoCapture(error: unknown) {
  const message = String(
    error && typeof error === "object" && "message" in error
      ? (error as { message?: unknown }).message
      : error || ""
  );
  return /no razorpay payment|does not exist|id provided does not exist|invalid payment|bad request/i.test(
    message
  );
}
