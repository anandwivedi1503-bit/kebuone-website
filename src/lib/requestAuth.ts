import type { DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  normalizeIndianPhone,
} from "@/lib/riderOwnership";

export {
  firebaseUserOwnsRider,
  normalizeIndianPhone,
  type RiderOwnershipRecord,
} from "@/lib/riderOwnership";

export type VerifiedFirebaseUser = {
  uid: string;
  phone: string;
  rawPhone: string;
  decodedToken: DecodedIdToken;
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