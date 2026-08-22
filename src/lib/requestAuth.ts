import type { DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
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
  userPhone?: string;
};

export function riderPayUnauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Please sign in again with your registered mobile number to pay.",
    },
    { status: 401 }
  );
}

/*
 * =========================================================
 * NORMALIZE INDIAN PHONE
 * =========================================================
 */

export function normalizeIndianPhone(
  value: unknown
): string {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length === 10) {
    return digits;
  }

  const lastTen = digits.slice(-10);
  if (/^[6-9]\d{9}$/.test(lastTen)) {
    return lastTen;
  }

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

  const firebasePhone = normalizeIndianPhone(firebaseUser.phone);
  const riderPhones = [rider.phone, rider.userPhone]
    .map((value) => normalizeIndianPhone(value))
    .filter(Boolean);

  return Boolean(
    firebasePhone && riderPhones.includes(firebasePhone)
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