import { getBookingPayableAmount, money } from "@/lib/gst";
import { generateSixDigitOtp, isOtpExpired, pickupOtpExpiry } from "@/lib/otp";
import { isRentToOwnBooking } from "@/lib/rtoInstallmentCycle";

type BookingLike = {
  rideStatus?: string;
  paymentStatus?: string;
  pendingAmount?: number;
  receivedAmount?: number;
  paymentDue?: number;
  rateApplied?: number;
  totalAmount?: number;
  gstAmount?: number;
  securityDeposit?: number;
  rentalMode?: string;
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
  const totalPayable = getBookingPayableAmount({
    ...booking,
    receivedAmount,
    pendingAmount,
  });
  const minimumForPickup = isRentToOwnBooking(booking)
    ? totalPayable
    : Math.min(totalPayable, Math.max(1, money(totalPayable * 0.5)));
  const pickupReady =
    minimumForPickup > 0.009 && receivedAmount + 0.009 >= minimumForPickup;
  const rideStatus =
    inRide || completed
      ? ride
      : pickupReady
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
  // Normal rentals issue pickup OTP after at least half the total is received.
  // Rent to Own remains payable in full before pickup.
  if (!completed && !inRide && !booking.pickupOTPVerified && pickupReady) {
    const existing = String(booking.pickupOTP || "").trim();
    const reusable = Boolean(
      existing &&
        booking.pickupOTPExpiry &&
        !isOtpExpired(booking.pickupOTPExpiry)
    );
    const otp = reusable ? existing : generateSixDigitOtp();
    pickupOTP = otp;
    bookingPatch.pickupOTP = otp;
    bookingPatch.pickupOTPExpiry = reusable
      ? booking.pickupOTPExpiry
      : pickupOtpExpiry();
  } else if (!completed && !inRide && !booking.pickupOTPVerified) {
    bookingPatch.pickupOTP = "";
    bookingPatch.pickupOTPExpiry = null;
  }

  let rideEndOTP: string | undefined;

  const vehicleStatus = completed
    ? null
    : inRide
      ? "In Ride"
      : pickupReady
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
