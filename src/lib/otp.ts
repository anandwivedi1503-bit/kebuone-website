import crypto from "crypto";

export const PICKUP_OTP_TTL_MS = 48 * 60 * 60 * 1000;
export const RIDE_END_OTP_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateSixDigitOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function pickupOtpExpiry(from = new Date()) {
  return new Date(from.getTime() + PICKUP_OTP_TTL_MS);
}

export function rideEndOtpExpiry(from = new Date()) {
  return new Date(from.getTime() + RIDE_END_OTP_TTL_MS);
}

export function isOtpExpired(expiry: Date | string | null | undefined) {
  if (!expiry) return false;
  const when = new Date(expiry);
  if (Number.isNaN(when.getTime())) return false;
  return when.getTime() < Date.now();
}
