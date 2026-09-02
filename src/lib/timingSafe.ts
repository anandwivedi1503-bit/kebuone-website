import crypto from "crypto";

export function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    crypto.timingSafeEqual(rightBuffer, rightBuffer);
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

/** Empty or missing configured secrets never match. */
export function providedSecretMatches(expected: string, received: string) {
  if (!expected || !received) return false;
  return timingSafeStringEqual(expected, received);
}
