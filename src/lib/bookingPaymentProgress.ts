import { generateSixDigitOtp, pickupOtpExpiry } from "@/lib/otp";

type BookingLike = {
  rideStatus?: string;
  paymentStatus?: string;
  pendingAmount?: number;
  receivedAmount?: number;
  pickupOTP?: string;
  pickupOTPExpiry?: Date | string | null;
  pickupOTPVerified?: boolean;
  rideEndOTP?: string;
  rideEndOTPExpiry?: Date | string | null;
};

export function isBookingStillPayable(booking: BookingLike) {
  const ride = String(booking.rideStatus || "");
  if (ride === "Cancelled" || ride === "Completed") {
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
  const fullyPaid = pendingAmount <= 0.009 && receivedAmount > 0.009;
  const rideStatus =
    inRide || completed
      ? ride
      : fullyPaid
        ? "Ready For Pickup"
        : receivedAmount > 0
          ? "Booked"
          : ride;

  const bookingPatch: Record<string, unknown> = {
    receivedAmount,
    pendingAmount,
    paymentStatus,
    rideStatus,
  };

  let pickupOTP: string | undefined;
  // Pickup OTP only after fare + deposit are fully received. Partial pay keeps the scooter booked.
  if (!completed && !inRide && !booking.pickupOTPVerified && fullyPaid) {
    const existing = String(booking.pickupOTP || "").trim();
    const otp = existing || generateSixDigitOtp();
    pickupOTP = otp;
    bookingPatch.pickupOTP = otp;
    bookingPatch.pickupOTPExpiry = booking.pickupOTPExpiry || pickupOtpExpiry();
  } else if (!completed && !inRide && !booking.pickupOTPVerified) {
    bookingPatch.pickupOTP = "";
    bookingPatch.pickupOTPExpiry = null;
  }

  let rideEndOTP: string | undefined;

  const vehicleStatus = completed
    ? null
    : inRide
      ? "In Ride"
      : fullyPaid
        ? "Ready For Pickup"
        : "Booked";

  const unlockedForPickup = Boolean(booking.pickupOTPVerified);

  return {
    paymentStatus,
    rideStatus,
    bookingPatch,
    pickupOTP,
    rideEndOTP,
    vehicleStatus,
    vehicleLockStatus: inRide || unlockedForPickup ? "Unlocked" : "Locked",
    updateVehicle: !completed,
    updateRiderLock: !completed && !inRide,
  };
}

export function bookingPaymentApplyFilter(
  bookingId: unknown,
  previousReceived: number,
  paidAmount: number
) {
  const receivedMatch =
    previousReceived <= 0.009
      ? {
          $or: [
            { receivedAmount: previousReceived },
            { receivedAmount: { $exists: false } },
            { receivedAmount: null },
            { receivedAmount: 0 },
          ],
        }
      : { receivedAmount: previousReceived };

  return {
    _id: bookingId,
    paymentStatus: { $ne: "Paid" },
    rideStatus: { $nin: ["Cancelled", "Completed"] },
    $and: [
      receivedMatch,
      {
        $or: [
          { pendingAmount: { $gte: paidAmount - 0.009 } },
          { pendingAmount: { $exists: false } },
          { pendingAmount: null },
        ],
      },
    ],
  };
}
