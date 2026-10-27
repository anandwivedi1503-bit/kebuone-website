/** Never show pickup/ride OTP digits on ops desks — yard enters code from rider. */
export function maskOtpDigits(code?: unknown, length = 6) {
  const digits = String(code || "").replace(/\D/g, "");
  const n = digits.length > 0 ? digits.length : length;
  return "•".repeat(Math.min(8, Math.max(4, n)));
}
