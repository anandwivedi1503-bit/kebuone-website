import { getBookingPayableAmount, getBookingRemainingAmount, money } from "@/lib/gst";
import { isRentToOwnBooking } from "@/lib/rtoInstallmentCycle";
import { isUnpaidPrePaymentReserve, type UnpaidReserveBooking } from "@/lib/unpaidPrePaymentReserve";

export const UNPAID_RESERVE_TTL_MS = 30 * 60 * 1000;

export type BookingPayTiming = {
  createdAt?: Date | string;
  updatedAt?: Date | string;
  receivedAmount?: unknown;
  paymentStatus?: unknown;
  rideStatus?: unknown;
  pickupOTPVerified?: unknown;
  bookingId?: unknown;
  vehicleId?: unknown;
  _id?: unknown;
};

/** Rental + GST portion of paymentDue (excludes refundable security deposit). */
export function bookingRentalDueTotal(booking: {
  paymentDue?: unknown;
  securityDeposit?: unknown;
  receivedAmount?: unknown;
  pendingAmount?: unknown;
  rateApplied?: unknown;
  totalAmount?: unknown;
  gstAmount?: unknown;
}) {
  const payable = getBookingPayableAmount(booking);
  const deposit = money(booking.securityDeposit);
  return money(Math.max(0, payable - deposit));
}

export function isUnpaidReserveTimedOut(
  booking?: BookingPayTiming | UnpaidReserveBooking | null,
  now = Date.now()
) {
  if (!booking || !isUnpaidPrePaymentReserve(booking as UnpaidReserveBooking)) {
    return false;
  }
  const created = new Date(String(booking.createdAt || "")).getTime();
  if (!Number.isFinite(created) || created <= 0) return false;
  return now - created >= UNPAID_RESERVE_TTL_MS;
}

export function reserveExpiredMessage() {
  return "This booking timed out without payment. Start a fresh booking — your scooter hold was released.";
}

export function minRiderPaymentInr(booking: Record<string, unknown>) {
  const remaining = getBookingRemainingAmount(booking);
  if (remaining <= 0.009) {
    return { min: 0, max: 0, firstPayment: false as const };
  }

  if (isRentToOwnBooking(booking)) {
    return {
      min: remaining,
      max: remaining,
      firstPayment: money(booking.receivedAmount) <= 0.009,
    };
  }

  const received = money(booking.receivedAmount);
  if (received > 0.009) {
    return { min: 1, max: remaining, firstPayment: false as const };
  }

  const rentalTotal = bookingRentalDueTotal(booking);
  const halfRental = money(rentalTotal * 0.5);
  const min = Math.min(remaining, Math.max(halfRental, 1));

  return {
    min,
    max: remaining,
    firstPayment: true as const,
    halfRental,
    rentalTotal,
  };
}

export function validateRiderPaymentAmount(
  booking: Record<string, unknown>,
  amountInr: number
): { ok: true } | { ok: false; message: string } {
  const { min, max, firstPayment, halfRental } = minRiderPaymentInr(booking);
  const amount = money(amountInr);

  if (max <= 0.009) {
    return { ok: false, message: "This booking has already been fully paid." };
  }

  if (amount < min - 0.001 || amount > max + 0.001) {
    if (firstPayment && halfRental !== undefined) {
      return {
        ok: false,
        message: `First payment must be at least 50% of rental (₹${halfRental.toFixed(2)}), up to ₹${max.toFixed(2)}.`,
      };
    }
    return {
      ok: false,
      message: `Enter a valid amount between ₹${min.toFixed(2)} and ₹${max.toFixed(2)}.`,
    };
  }

  return { ok: true };
}
