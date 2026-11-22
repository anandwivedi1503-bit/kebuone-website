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
  userPhone?: unknown;
  pickupOtpTestMode?: boolean;
};

function normalizedPhone(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

export function isPickupOtpTestRider(booking: PickupPaymentSource) {
  if (booking.pickupOtpTestMode === true) return true;
  const configured = typeof process !== "undefined"
    ? normalizedPhone(process.env.EVUDDY_PICKUP_OTP_TEST_PHONE)
    : "";
  const phone = normalizedPhone(booking.userPhone);
  return configured.length === 10 && phone === configured;
}

export function pickupPaymentThreshold(booking: PickupPaymentSource) {
  const totalPayable = getBookingPayableAmount(booking);
  if (totalPayable <= 0.009) return 0;

  if (isRentToOwnBooking(booking)) return totalPayable;
  if (isPickupOtpTestRider(booking)) return Math.min(totalPayable, 1);
  return Math.min(totalPayable, Math.max(1, money(totalPayable * 0.5)));
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
