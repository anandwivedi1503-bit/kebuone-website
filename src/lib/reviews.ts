export const REVIEW_STATUSES = ["Pending", "Published", "Hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function clampStars(value: unknown, fallback = 0) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(5, n);
}

export function riderPublicDisplayName(fullName: unknown) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "EVUDDY rider";
  const first = parts[0].replace(/[^A-Za-z\u0900-\u097F'.-]/g, "").slice(0, 24);
  if (!first) return "EVUDDY rider";
  if (parts.length === 1) return first;
  const last = parts[parts.length - 1].replace(/[^A-Za-z\u0900-\u097F]/g, "");
  const initial = last.charAt(0).toUpperCase();
  return initial ? `${first} ${initial}.` : first;
}

export function sanitizeReviewComment(value: unknown, max = 500) {
  return String(value || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function defaultReviewStatus(stars: number): ReviewStatus {
  return stars >= 4 ? "Published" : "Pending";
}

export function bookingEligibleForReview(booking: {
  rideStatus?: unknown;
  rentalMode?: unknown;
  receivedAmount?: unknown;
}) {
  const status = String(booking.rideStatus || "");
  if (status === "Cancelled") return false;
  if (status === "Completed") return true;
  return (
    String(booking.rentalMode || "") === "Rent To Own" &&
    Number(booking.receivedAmount || 0) > 0.009
  );
}

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return REVIEW_STATUSES.includes(String(value || "") as ReviewStatus);
}
