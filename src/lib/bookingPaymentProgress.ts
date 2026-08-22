import { generateSixDigitOtp, pickupOtpExpiry } from "@/lib/otp";

type BookingLike = {
  rideStatus?: string;
  paymentStatus?: string;
  pendingAmount?: number;
  receivedAmount?: number;
  pickupOTP?: string;
  pickupOTPExpiry?: Date | string | null;
  pickupOTPVerified?: boolean;
};

export function isBookingStillPayable(booking: BookingLike) {
  if (String(booking.rideStatus || "") === "Cancelled") {
    return false;
  }
  if (booking.paymentStatus === "Paid" || Number(booking.pendingAmount) <= 0) {
    return false;
  }
  return true;
}

export function nextPaymentProgress(
  booking: BookingLike,
  receivedAmount: number,
  pendingAmount: number
) {
  const ride = String(booking.rideStatus || "");
  const inRide = ride === "In Ride";
  const completed = ride === "Completed";
  const paymentStatus = pendingAmount <= 0 ? "Paid" : "Partial";
  const rideStatus =
    inRide || completed
      ? ride
      : receivedAmount > 0
        ? "Ready For Pickup"
        : ride;

  const bookingPatch: Record<string, unknown> = {
    receivedAmount,
    pendingAmount,
    paymentStatus,
    rideStatus,
  };

  let pickupOTP: string | undefined;
  if (!completed && !inRide && !booking.pickupOTPVerified && receivedAmount > 0) {
    const existing = String(booking.pickupOTP || "").trim();
    const otp = existing || generateSixDigitOtp();
    pickupOTP = otp;
    bookingPatch.pickupOTP = otp;
    bookingPatch.pickupOTPExpiry = booking.pickupOTPExpiry || pickupOtpExpiry();
  }

  const vehicleStatus = completed
    ? null
    : inRide
      ? "In Ride"
      : receivedAmount > 0
        ? "Ready For Pickup"
        : "Booked";

  return {
    paymentStatus,
    rideStatus,
    bookingPatch,
    pickupOTP,
    vehicleStatus,
    vehicleLockStatus: inRide ? "Unlocked" : "Locked",
    updateVehicle: !completed,
    updateRiderLock: !completed && !inRide,
  };
}
