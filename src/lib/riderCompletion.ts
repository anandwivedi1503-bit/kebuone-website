const GHOST_AFTER_COMPLETE_MS = 30 * 60 * 1000;
const PRESENT_COMPLETED_MS = 2 * 60 * 60 * 1000;

function asTime(value: unknown) {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  const ms = new Date(String(value || "")).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function completedAtMs(booking?: {
  completedAt?: unknown;
  actualRideEnd?: unknown;
  updatedAt?: unknown;
} | null) {
  if (!booking) return 0;
  return (
    asTime(booking.completedAt) ||
    asTime(booking.actualRideEnd) ||
    asTime(booking.updatedAt)
  );
}

export function isRecentCompletedRide(
  booking?: {
    rideStatus?: unknown;
    completedAt?: unknown;
    actualRideEnd?: unknown;
    updatedAt?: unknown;
  } | null,
  nowMs = Date.now()
) {
  if (String(booking?.rideStatus || "") !== "Completed") return false;
  const at = completedAtMs(booking);
  return at > 0 && nowMs - at <= PRESENT_COMPLETED_MS;
}

/** Unpaid reserve created right after yard ride-end — usually Enter on the payment form. */
export function isUnpaidGhostAfterCompleted(
  active?: {
    createdAt?: unknown;
    receivedAmount?: unknown;
    pickupOTPVerified?: unknown;
    rideStatus?: unknown;
    paymentStatus?: unknown;
  } | null,
  completed?: {
    completedAt?: unknown;
    actualRideEnd?: unknown;
    updatedAt?: unknown;
    rideStatus?: unknown;
  } | null,
  nowMs = Date.now()
) {
  if (!active || !completed) return false;
  if (String(completed.rideStatus || "Completed") !== "Completed") return false;
  const finishedAt = completedAtMs(completed);
  const createdAt = asTime(active.createdAt);
  if (!finishedAt || !createdAt) return false;
  if (createdAt < finishedAt) return false;
  if (createdAt - finishedAt > GHOST_AFTER_COMPLETE_MS) return false;
  if (nowMs - createdAt > GHOST_AFTER_COMPLETE_MS) return false;
  if (Number(active.receivedAmount || 0) > 0.009) return false;
  if (active.pickupOTPVerified) return false;
  const ride = String(active.rideStatus || "Booked");
  if (["In Ride", "Completed", "Cancelled", "Ready For Pickup"].includes(ride)) {
    return false;
  }
  const pay = String(active.paymentStatus || "Pending");
  return pay === "Pending";
}
