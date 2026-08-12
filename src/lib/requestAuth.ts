import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebaseAdmin";

export type VerifiedFirebaseUser = {
  uid: string;
  phone: string;
  decodedToken: DecodedIdToken;
};

/**
 * Minimal rider shape required for ownership verification.
 *
 * This is intentionally separate from the full Rider model so that
 * authentication code does not depend on the complete Mongoose type.
 */
export type RiderOwnershipRecord = {
  firebaseUid?: string;
  phone?: string;
};

/**
 * Normalize an Indian phone number to its last 10 digits.
 *
 * Examples:
 * +91 9876543210 -> 9876543210
 * 919876543210  -> 9876543210
 * 9876543210    -> 9876543210
 */
export function normalizeIndianPhone(value: unknown): string {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits.slice(-10);
}

/**
 * Extract Firebase ID token from:
 *
 * Authorization: Bearer <token>
 */
function getBearerToken(req: Request): string {
  const authorization =
    req.headers.get("authorization") || "";

  if (
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return "";
  }

  return authorization.slice(7).trim();
}

/**
 * Verify Firebase ID token server-side.
 *
 * Returns null if:
 * - token is missing
 * - token is invalid
 * - token is expired
 * - Firebase verification fails
 */
export async function getVerifiedFirebaseUser(
  req: Request,
  explicitToken?: unknown
): Promise<VerifiedFirebaseUser | null> {
  const token = String(
    explicitToken ||
      getBearerToken(req) ||
      ""
  ).trim();

  if (!token) {
    return null;
  }

  try {
    const decodedToken =
      await adminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      phone: normalizeIndianPhone(
        decodedToken.phone_number
      ),
      decodedToken,
    };
  } catch {
    return null;
  }
}

/**
 * Verify that the authenticated Firebase user owns
 * the requested rider account.
 *
 * Ownership is accepted when either:
 *
 * 1. Firebase UID matches rider.firebaseUid
 * OR
 * 2. Verified Firebase phone matches rider.phone
 */
export function firebaseUserOwnsRider(
  firebaseUser: VerifiedFirebaseUser | null,
  rider: RiderOwnershipRecord | null
): boolean {
  if (!firebaseUser || !rider) {
    return false;
  }

  const riderPhone =
    normalizeIndianPhone(rider.phone);

  return (
    Boolean(
      firebaseUser.uid &&
        rider.firebaseUid === firebaseUser.uid
    ) ||
    Boolean(
      firebaseUser.phone &&
        riderPhone === firebaseUser.phone
    )
  );
}