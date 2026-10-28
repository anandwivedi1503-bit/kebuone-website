import crypto from "crypto";

export function razorpaySignaturesMatch(expected: string, received: string) {
  const a = String(expected || "").trim();
  const b = String(received || "").trim();
  if (!a || !b) return false;
  try {
    const left = Buffer.from(a, "utf8");
    const right = Buffer.from(b, "utf8");
    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
