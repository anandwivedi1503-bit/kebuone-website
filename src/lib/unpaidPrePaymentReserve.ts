export type UnpaidReserveBooking = {
  _id?: unknown;
  bookingId?: unknown;
  vehicleId?: unknown;
  rideStatus?: unknown;
  paymentStatus?: unknown;
  receivedAmount?: unknown;
  pickupOTPVerified?: unknown;
};

/** Reserved scooter but no payment yet — do not auto-open the payment step. */
export function isUnpaidPrePaymentReserve(
  booking?: UnpaidReserveBooking | null
): boolean {
  if (!booking?._id || !String(booking.bookingId || "").trim()) return false;
  if (!String(booking.vehicleId || "").trim()) return false;
  if (Boolean(booking.pickupOTPVerified)) return false;

  const received = Number(booking.receivedAmount ?? 0);
  if (received > 0.009) return false;

  const ride = String(booking.rideStatus || "");
  if (!["Booked", "Reserved", "Payment Pending"].includes(ride)) return false;

  return String(booking.paymentStatus || "") === "Pending";
}
