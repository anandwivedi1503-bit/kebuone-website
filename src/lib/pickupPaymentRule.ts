import { getBookingPayableAmount, money } from "@/lib/gst";
import { isRentToOwnBooking } from "@/lib/rtoInstallmentCycle";

export type PickupPaymentSource = {
  rentalMode?: string;
  paymentDue?: unknown;
  receivedAmount?: unknown;
  pendingAmount?: unknown;
  rateApplied?: unknown;
  totalAmount?: unknown;
  gstAmount?: unknown;
  securityDeposit?: unknown;
};

export function pickupPaymentThreshold(booking: PickupPaymentSource) {
  const totalPayable = getBookingPayableAmount(booking);
  if (totalPayable <= 0.009) return 0;

  return isRentToOwnBooking(booking)
    ? totalPayable
    : Math.min(totalPayable, Math.max(1, money(totalPayable * 0.5)));
}

export function pickupPaymentTopUp(booking: PickupPaymentSource) {
  return money(
    Math.max(0, pickupPaymentThreshold(booking) - money(booking.receivedAmount))
  );
}

export function hasPickupPaymentMinimum(
  booking: PickupPaymentSource,
  receivedAmount: unknown = booking.receivedAmount
) {
  const threshold = pickupPaymentThreshold(booking);
  return threshold > 0.009 && money(receivedAmount) + 0.009 >= threshold;
}
