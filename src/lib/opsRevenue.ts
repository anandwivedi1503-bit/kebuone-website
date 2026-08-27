export const REVENUE_TRANSACTION_TYPES = [
  "Booking Payment",
  "Ride Payment",
  "Extension Payment",
] as const;

export function isRevenueTransaction(row: {
  status?: unknown;
  transactionType?: unknown;
}) {
  const status = String(row.status || "");
  const type = String(row.transactionType || "");
  return status === "Success" && REVENUE_TRANSACTION_TYPES.includes(type as (typeof REVENUE_TRANSACTION_TYPES)[number]);
}

export function revenueAmount(row: { amount?: unknown }) {
  return Math.max(0, Number(row.amount || 0));
}

export function revenueGst(row: { gstAmount?: unknown }) {
  return Math.max(0, Number(row.gstAmount || 0));
}

/** Rent + GST already collected. Security deposit is held, not revenue. */
export function bookingRentalCollected(booking: {
  receivedAmount?: unknown;
  securityDeposit?: unknown;
  gstAmount?: unknown;
  rateApplied?: unknown;
  rideStatus?: unknown;
}) {
  if (String(booking.rideStatus || "") === "Cancelled") return 0;
  const received = Math.max(0, Number(booking.receivedAmount || 0));
  const deposit = Math.max(0, Number(booking.securityDeposit || 0));
  const rentalWithGst =
    Math.max(0, Number(booking.rateApplied || 0)) + Math.max(0, Number(booking.gstAmount || 0));
  if (rentalWithGst > 0) {
    return Math.min(received, rentalWithGst);
  }
  return Math.max(0, received - deposit);
}
