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

/*
 * =========================================================
 * NORMALIZE INDIAN PHONE
 * =========================================================
 */

export function normalizeIndianPhone(
  value: unknown
): string {
  const digits = String(value ?? "").replace(
    /\D/g,
    ""
  );

  if (!digits) {
    return "";
  }

  /*
   * +91XXXXXXXXXX
   */
  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits.slice(2);
  }

  /*
   * 10-digit Indian number.
   */
  if (digits.length === 10) {
    return digits;
  }

  /*
   * IMPORTANT:
   *
   * Do not silently accept arbitrary long numbers
   * by taking the last 10 digits.
   */
  return "";
}

/*
 * =========================================================
 * GET BEARER TOKEN
 * =========================================================
 */

function getBearerToken(
  req: Request
): string {
  const authorization =
    req.headers
      .get("authorization")
      ?.trim() || "";

  if (!authorization) {
    return "";
  }

  const parts =
    authorization.split(/\s+/);

  if (parts.length !== 2) {
    return "";
  }

  const [
    scheme,
    token,
  ] = parts;

  if (
    scheme.toLowerCase() !==
    "bearer"
  ) {
    return "";
  }

  return token.trim();
}

/*
 * =========================================================
 * VERIFY FIREBASE TOKEN
 * =========================================================
 */

export async function getVerifiedFirebaseUser(
  req: Request,
  explicitToken?: unknown
): Promise<VerifiedFirebaseUser | null> {
  const token =
    typeof explicitToken ===
      "string" &&
    explicitToken.trim()
      ? explicitToken.trim()
      : getBearerToken(req);

  if (!token) {
    return null;
  }

  try {
    const decodedToken =
      await adminAuth.verifyIdToken(
        token
      );

    if (!decodedToken.uid) {
      return null;
    }

    const rawPhone =
      typeof decodedToken.phone_number ===
      "string"
        ? decodedToken.phone_number.trim()
        : "";

    const phone =
      normalizeIndianPhone(
        rawPhone
      );

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

/*
 * =========================================================
 * RIDER OWNERSHIP
 * =========================================================
 */

export function firebaseUserOwnsRider(
  firebaseUser:
    | VerifiedFirebaseUser
    | null,
  rider:
    | RiderOwnershipRecord
    | null
): boolean {
  if (
    !firebaseUser ||
    !rider
  ) {
    return false;
  }

  /*
   * Firebase UID is the strongest ownership match.
   */

  if (
    firebaseUser.uid &&
    rider.firebaseUid &&
    firebaseUser.uid ===
      rider.firebaseUid
  ) {
    return true;
  }

  /*
   * Verified Firebase phone is the
   * fallback ownership match.
   */

  const firebasePhone =
    normalizeIndianPhone(
      firebaseUser.phone
    );

  const riderPhone =
    normalizeIndianPhone(
      rider.phone
    );

  return Boolean(
    firebasePhone &&
      riderPhone &&
      firebasePhone ===
        riderPhone
  );
}

/*
 * =========================================================
 * REGISTRATION PHONE MATCH
 * =========================================================
 */

export function firebasePhoneMatches(
  firebaseUser:
    | VerifiedFirebaseUser
    | null,
  submittedPhone: unknown
): boolean {
  if (!firebaseUser) {
    return false;
  }

  const firebasePhone =
    normalizeIndianPhone(
      firebaseUser.phone
    );

  const submitted =
    normalizeIndianPhone(
      submittedPhone
    );

  if (
    !firebasePhone ||
    !submitted
  ) {
    return false;
  }

  return (
    firebasePhone ===
    submitted
  );
}