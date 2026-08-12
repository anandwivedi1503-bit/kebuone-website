import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebaseAdmin";

export type VerifiedFirebaseUser = {
  uid: string;
  phone: string;
  rawPhone: string;
  decodedToken: DecodedIdToken;
};

 export type RiderOwnershipRecord = {
  firebaseUid?: string;
  phone?: string;
};

/**
 * Normalize an Indian phone number to its last 10 digits.
 *
 * Examples:
 *
 * +91 9876543210 -> 9876543210
 * 919876543210  -> 9876543210
 * 9876543210    -> 9876543210
 */
export function normalizeIndianPhone(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
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
    req.headers.get("authorization")?.trim() ?? "";

  if (!authorization) {
    return "";
  }

  const [scheme, token] = authorization.split(/\s+/);

  if (!scheme || !token) {
    return "";
  }

  if (scheme.toLowerCase() !== "bearer") {
    return "";
  }

  return token.trim();
}

/**
 * Verify Firebase ID token server-side.
 *
 * Returns null when:
 * - token is missing
 * - token is malformed
 * - token is invalid
 * - token is expired
 * - Firebase verification fails
 */
export async function getVerifiedFirebaseUser(
  req: Request,
  explicitToken?: unknown
): Promise<VerifiedFirebaseUser | null> {
  const token =
    typeof explicitToken === "string" &&
    explicitToken.trim()
      ? explicitToken.trim()
      : getBearerToken(req);

  if (!token) {
    return null;
  }

  try {
    const decodedToken =
      await adminAuth.verifyIdToken(token);

    const rawPhone =
      typeof decodedToken.phone_number === "string"
        ? decodedToken.phone_number.trim()
        : "";

    const phone =
      normalizeIndianPhone(rawPhone);

    /*
     * Firebase UID is mandatory.
     */
    if (!decodedToken.uid) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      phone,
      rawPhone,
      decodedToken,
    };
  } catch (error) {
    console.error(
      "FIREBASE ID TOKEN VERIFICATION FAILED:",
      error
    );

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

  const uidMatches =
    Boolean(firebaseUser.uid) &&
    Boolean(rider.firebaseUid) &&
    firebaseUser.uid === rider.firebaseUid;

  if (uidMatches) {
    return true;
  }

  const firebasePhone =
    normalizeIndianPhone(firebaseUser.phone);

  const riderPhone =
    normalizeIndianPhone(rider.phone);

  return Boolean(
    firebasePhone &&
      riderPhone &&
      firebasePhone === riderPhone
  );
}

/**
 * Strictly verify that the Firebase phone matches
 * the phone submitted during registration.
 *
 * This should be used by registration.
 */
export function firebasePhoneMatches(
  firebaseUser: VerifiedFirebaseUser | null,
  submittedPhone: unknown
): boolean {
  if (!firebaseUser) {
    return false;
  }

  const firebasePhone =
    normalizeIndianPhone(firebaseUser.phone);

  const submitted =
    normalizeIndianPhone(submittedPhone);

  if (!firebasePhone || !submitted) {
    return false;
  }

  return firebasePhone === submitted;
}