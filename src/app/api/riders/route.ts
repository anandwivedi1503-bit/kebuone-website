import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";
import Counter from "@/models/Counter";

import { adminAuth } from "@/lib/firebaseAdmin";

import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import {
  ensureRiderWallet,
  RiderWalletError,
} from "@/lib/ensureRiderWallet";

export const runtime = "nodejs";

/* =========================================================
   VALIDATION
========================================================= */

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]{2,79}$/;

const PHONE_REGEX = /^[6-9]\d{9}$/;

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const AADHAAR_REGEX = /^\d{12}$/;

const DRIVING_LICENSE_REGEX =
  /^[A-Z]{2}\d{2}\d{11}$/;

/* =========================================================
   TYPES
========================================================= */

type ExistingRiderRecord = {
  _id: mongoose.Types.ObjectId;

  riderId: string;

  fullName: string;

  phone: string;

  email?: string;

  firebaseUid?: string;

  approvalStatus:
    | "Under Review"
    | "Approved"
    | "Rejected"
    | "Suspended";

  kycStatus:
    | "Pending"
    | "Approved"
    | "Rejected";

  status:
    | "Active"
    | "Inactive"
    | "Blocked"
    | "Suspended";

  bookingEnabled: boolean;

  blacklisted: boolean;

  rejectedReason?: string;
};

type AdminRiderRecord = {
  _id: mongoose.Types.ObjectId;

  riderId: string;

  fullName: string;

  phone: string;

  email?: string;

  kycStatus: string;

  approvalStatus: string;

  status: string;

  bookingEnabled: boolean;

  activeRide: boolean;

  blacklisted?: boolean;

  aadhaarFrontUrl?: string;

  aadhaarBackUrl?: string;

  licenseFrontUrl?: string;

  licenseBackUrl?: string;

  profilePhotoUrl?: string;

  createdAt?: Date;

  updatedAt?: Date;
};

type WalletAdminRecord = {
  riderId: string;

  balance?: number;

  status?: "Active" | "Blocked";
};

/* =========================================================
   HELPERS
========================================================= */

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Normalize Indian phone numbers.
 *
 * Supports:
 *
 * 9876543210
 * +919876543210
 * 919876543210
 * +91 9876543210
 */
function normalizePhone(value: unknown): string {
  const digits = clean(value).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return digits.slice(2);
  }

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return digits;
}

function normalizeLicense(
  value: unknown
): string {
  return clean(value)
    .toUpperCase()
    .replace(/\s/g, "");
}

function optionalString(
  value: unknown
): string | undefined {
  const cleaned = clean(value);

  return cleaned || undefined;
}

function optionalPhone(
  value: unknown
): string | undefined {
  const normalized = normalizePhone(value);

  return normalized || undefined;
}

function isSafeCloudinaryUrl(
  value: unknown
): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(String(value));

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

function isDuplicateKeyError(
  error: unknown
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    Number(
      (error as { code?: unknown }).code
    ) === 11000
  );
}

/* =========================================================
   SAFE RIDER RESPONSE
========================================================= */

function safeRiderResponse(rider: {
  riderId: string;

  fullName: string;

  phone: string;

  approvalStatus: string;

  kycStatus: string;

  status: string;

  bookingEnabled: boolean;
}) {
  return {
    riderId: rider.riderId,

    fullName: rider.fullName,

    phone: rider.phone,

    approvalStatus:
      rider.approvalStatus,

    kycStatus:
      rider.kycStatus,

    status:
      rider.status,

    bookingEnabled:
      rider.bookingEnabled,
  };
}

/* =========================================================
   POST
   RIDER REGISTRATION
========================================================= */

export async function POST(req: Request) {
  let createdRiderId: string | null = null;

  try {
    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       READ REQUEST BODY
    ===================================================== */

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_JSON",
          message:
            "Invalid registration request.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       READ INPUT
    ===================================================== */

    const fullName =
      clean(body.fullName);

    const phone =
      normalizePhone(body.phone);

    const email =
      clean(body.email).toLowerCase();

    const aadhaarNumber =
      clean(body.aadhaarNumber);

    const drivingLicense =
      normalizeLicense(
        body.drivingLicense
      );

    const firebaseIdToken =
      clean(body.firebaseIdToken);

    /* =====================================================
       OPTIONAL INPUT
    ===================================================== */

    const emergencyContactName =
      optionalString(
        body.emergencyContactName
      );

    const emergencyContactPhone =
      optionalPhone(
        body.emergencyContactPhone
      );

    const reference1Name =
      optionalString(
        body.reference1Name
      );

    const reference1Phone =
      optionalPhone(
        body.reference1Phone
      );

    const reference2Name =
      optionalString(
        body.reference2Name
      );

    const reference2Phone =
      optionalPhone(
        body.reference2Phone
      );

    const instagramId =
      optionalString(
        body.instagramId
      );

    const facebookId =
      optionalString(
        body.facebookId
      );

    /* =====================================================
       DOCUMENT URLS
    ===================================================== */

    const aadhaarFrontUrl =
      clean(body.aadhaarFrontUrl);

    const aadhaarBackUrl =
      clean(body.aadhaarBackUrl);

    const licenseFrontUrl =
      clean(body.licenseFrontUrl);

    const licenseBackUrl =
      clean(body.licenseBackUrl);

    const profilePhotoUrl =
      clean(body.profilePhotoUrl);

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    const errors: string[] = [];

    if (!firebaseIdToken) {
      errors.push(
        "Phone OTP verification is required."
      );
    }

    if (!NAME_REGEX.test(fullName)) {
      errors.push(
        "Enter a valid full name."
      );
    }

    if (!PHONE_REGEX.test(phone)) {
      errors.push(
        "Enter a valid Indian mobile number."
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push(
        "Enter a valid email address."
      );
    }

    if (!AADHAAR_REGEX.test(aadhaarNumber)) {
      errors.push(
        "Aadhaar number must be exactly 12 digits."
      );
    }

    /*
     * Driving license is optional.
     */

    if (
      drivingLicense &&
      !DRIVING_LICENSE_REGEX.test(
        drivingLicense
      )
    ) {
      errors.push(
        "Enter a valid driving license number."
      );
    }

    /* =====================================================
       OPTIONAL PHONE VALIDATION
    ===================================================== */

    if (
      emergencyContactPhone &&
      !PHONE_REGEX.test(
        emergencyContactPhone
      )
    ) {
      errors.push(
        "Emergency contact phone number is invalid."
      );
    }

    if (
      reference1Phone &&
      !PHONE_REGEX.test(
        reference1Phone
      )
    ) {
      errors.push(
        "Reference 1 phone number is invalid."
      );
    }

    if (
      reference2Phone &&
      !PHONE_REGEX.test(
        reference2Phone
      )
    ) {
      errors.push(
        "Reference 2 phone number is invalid."
      );
    }

    /* =====================================================
       REQUIRED DOCUMENTS
    ===================================================== */

    if (!aadhaarFrontUrl) {
      errors.push(
        "Aadhaar Front is required."
      );
    }

    if (!aadhaarBackUrl) {
      errors.push(
        "Aadhaar Back is required."
      );
    }

    if (!profilePhotoUrl) {
      errors.push(
        "Profile photo is required."
      );
    }

    /* =====================================================
       DOCUMENT URL VALIDATION
    ===================================================== */

    const documents = [
      {
        label: "Aadhaar Front",
        url: aadhaarFrontUrl,
        required: true,
      },
      {
        label: "Aadhaar Back",
        url: aadhaarBackUrl,
        required: true,
      },
      {
        label: "Driving License Front",
        url: licenseFrontUrl,
        required: false,
      },
      {
        label: "Driving License Back",
        url: licenseBackUrl,
        required: false,
      },
      {
        label: "Profile Photo",
        url: profilePhotoUrl,
        required: true,
      },
    ];

    for (const document of documents) {
      if (!document.url) {
        if (document.required) {
          errors.push(
            `${document.label} is required.`
          );
        }

        continue;
      }

      if (
        !isSafeCloudinaryUrl(
          document.url
        )
      ) {
        errors.push(
          `${document.label} must be uploaded through the approved document upload service.`
        );
      }
    }

    /* =====================================================
       DUPLICATE DOCUMENT PROTECTION
    ===================================================== */

    if (
      aadhaarFrontUrl &&
      aadhaarBackUrl &&
      aadhaarFrontUrl ===
        aadhaarBackUrl
    ) {
      errors.push(
        "Aadhaar Front and Aadhaar Back cannot be the same file."
      );
    }

    if (
      licenseFrontUrl &&
      licenseBackUrl &&
      licenseFrontUrl ===
        licenseBackUrl
    ) {
      errors.push(
        "Driving License Front and Driving License Back cannot be the same file."
      );
    }

    if (
      aadhaarFrontUrl &&
      licenseFrontUrl &&
      aadhaarFrontUrl ===
        licenseFrontUrl
    ) {
      errors.push(
        "Aadhaar and Driving License cannot use the same document."
      );
    }

    if (
      profilePhotoUrl &&
      [
        aadhaarFrontUrl,
        aadhaarBackUrl,
        licenseFrontUrl,
        licenseBackUrl,
      ].includes(profilePhotoUrl)
    ) {
      errors.push(
        "Profile photo must be different from uploaded documents."
      );
    }

    /* =====================================================
       OPTIONAL NAME VALIDATION
    ===================================================== */

    if (
      reference1Name &&
      !NAME_REGEX.test(
        reference1Name
      )
    ) {
      errors.push(
        "Reference Person 1 name is invalid."
      );
    }

    if (
      reference2Name &&
      !NAME_REGEX.test(
        reference2Name
      )
    ) {
      errors.push(
        "Reference Person 2 name is invalid."
      );
    }

    /* =====================================================
       RETURN VALIDATION ERRORS
    ===================================================== */

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errorCode:
            "VALIDATION_ERROR",
          errors,
          message:
            errors.join(" "),
        },
        { status: 400 }
      );
    }

    /* =====================================================
       FIREBASE VERIFICATION
    ===================================================== */

    let decodedToken;

    try {
      decodedToken =
        await adminAuth.verifyIdToken(
          firebaseIdToken
        );
    } catch (error) {
      console.error(
        "FIREBASE TOKEN VERIFICATION ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          errorCode:
            "INVALID_FIREBASE_TOKEN",
          message:
            "Invalid or expired Firebase verification. Please verify OTP again.",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       FIREBASE UID
    ===================================================== */

    if (!decodedToken.uid) {
      return NextResponse.json(
        {
          success: false,
          errorCode:
            "INVALID_FIREBASE_ACCOUNT",
          message:
            "Invalid Firebase account.",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       VERIFIED FIREBASE PHONE
    ===================================================== */

    const verifiedPhone =
      normalizePhone(
        decodedToken.phone_number
      );

    if (
      !verifiedPhone ||
      verifiedPhone !== phone
    ) {
      return NextResponse.json(
        {
          success: false,
          errorCode:
            "PHONE_MISMATCH",
          field: "phone",
          message:
            "The verified phone number does not match the registration phone number.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       EXISTING RIDER CHECK
       
       IMPORTANT:
       Firebase UID is checked first.

       This allows the same authenticated rider
       to safely retry the registration request
       without creating a second rider.
    ===================================================== */

    const existingByFirebase =
  await Rider.findOne({
    firebaseUid: decodedToken.uid,
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  })
        .select(
          [
            "_id",
            "riderId",
            "fullName",
            "phone",
            "email",
            "firebaseUid",
            "approvalStatus",
            "kycStatus",
            "status",
            "bookingEnabled",
            "blacklisted",
            "rejectedReason",
          ].join(" ")
        )
        .lean<ExistingRiderRecord | null>();

    if (existingByFirebase) {
      try {
        await ensureRiderWallet(
          {
            _id: existingByFirebase._id,
            riderId: existingByFirebase.riderId,
            fullName: existingByFirebase.fullName,
            phone: existingByFirebase.phone,
            approvalStatus:
              existingByFirebase.approvalStatus,
            kycStatus:
              existingByFirebase.kycStatus,
            status:
              existingByFirebase.status,
            bookingEnabled:
              existingByFirebase.bookingEnabled,
            blacklisted:
              existingByFirebase.blacklisted,
          },
          "System"
        );
      } catch (walletError) {
        console.error(
          "WALLET REPAIR FAILED FOR EXISTING RIDER:",
          walletError
        );

        if (
          walletError instanceof
          RiderWalletError
        ) {
          return NextResponse.json(
            {
              success: false,
              errorCode:
                walletError.code,
              message:
                walletError.message,
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            errorCode:
              "WALLET_CREATION_FAILED",
            message:
              "Rider account exists, but the wallet could not be synchronized.",
          },
          { status: 500 }
        );
      }

      return buildExistingRiderResponse(
        existingByFirebase,
        "firebaseUid"
      );
    }

    /* =====================================================
       DUPLICATE FIELD CHECKS
       
       Firebase UID did not already belong to a rider.
       Now protect phone/email/Aadhaar/license.
    ===================================================== */

    const activeRiderFilter = {
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } },
  ],
};

const duplicateChecks: Array<{
  field: string;
  value: string;
  query: Record<string, unknown>;
}> = [
  {
    field: "phone",
    value: phone,
    query: {
      $and: [
        activeRiderFilter,
        { phone },
      ],
    },
  },
  {
    field: "email",
    value: email,
    query: {
      $and: [
        activeRiderFilter,
        { email },
      ],
    },
  },
  {
    field: "aadhaarNumber",
    value: aadhaarNumber,
    query: {
      $and: [
        activeRiderFilter,
        { aadhaarNumber },
      ],
    },
  },
];

if (drivingLicense) {
  duplicateChecks.push({
    field: "drivingLicense",
    value: drivingLicense,
    query: {
      $and: [
        activeRiderFilter,
        { drivingLicense },
      ],
    },
  });
}

    for (const check of duplicateChecks) {
      if (!check.value) {
        continue;
      }

      const duplicate =
        await Rider.findOne(
          check.query
        )
          .select(
            [
              "_id",
              "riderId",
              "fullName",
              "phone",
              "email",
              "firebaseUid",
              "approvalStatus",
              "kycStatus",
              "status",
              "bookingEnabled",
              "blacklisted",
              "rejectedReason",
            ].join(" ")
          )
          .lean<ExistingRiderRecord | null>();

      if (!duplicate) {
        continue;
      }

      /*
       * This means the unique field belongs
       * to another Firebase account.
       *
       * Never let a different Firebase account
       * take over an existing rider.
       */

      return buildExistingRiderResponse(
        duplicate,
        check.field
      );
    }

    /* =====================================================
       GENERATE RIDER ID
       
       No MongoDB multi-document transaction is used.
       This preserves compatibility with MongoDB
       deployments where transactions may not be
       available.
    ===================================================== */

    const counter =
      await Counter.findByIdAndUpdate(
        "riderSequence",
        {
          $inc: {
            seq: 1,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    if (!counter) {
      throw new Error(
        "Failed to generate Rider ID."
      );
    }

    const riderId =
      `RDR-${String(
        counter.seq
      ).padStart(6, "0")}`;

    createdRiderId = riderId;

    /* =====================================================
       CREATE RIDER
    ===================================================== */

    let rider;

    try {
      rider =
        await Rider.create({
          /* ==============================
             IDENTITY
          ============================== */

          riderId,

          fullName,

          phone,

          email,

          /* ==============================
             KYC
          ============================== */

          aadhaarNumber,

          drivingLicense:
            drivingLicense ||
            undefined,

          aadhaarFrontUrl,

          aadhaarBackUrl,

          licenseFrontUrl:
            licenseFrontUrl ||
            undefined,

          licenseBackUrl:
            licenseBackUrl ||
            undefined,

          profilePhotoUrl,

          /* ==============================
             EMERGENCY
          ============================== */

          emergencyContactName,

          emergencyContactPhone,

          /* ==============================
             REFERENCES
          ============================== */

          reference1Name,

          reference1Phone,

          reference2Name,

          reference2Phone,

          /* ==============================
             SOCIAL
          ============================== */

          instagramId,

          facebookId,

          /* ==============================
             FIREBASE
             SERVER AUTHORITATIVE
          ============================== */

          firebaseUid:
            decodedToken.uid,

          verifiedPhoneNumber:
            decodedToken.phone_number ||
            `+91${phone}`,

          phoneVerified: true,

          lastOtpVerifiedAt:
            new Date(),

          /* ==============================
             INITIAL APPROVAL STATE
          ============================== */

          approvalStatus:
            "Under Review",

          kycStatus:
            "Pending",

          status:
            "Blocked",

          bookingEnabled:
            false,

          /* ==============================
             RIDE STATE
          ============================== */

          activeRide:
            false,

          /* ==============================
             WALLET TOTALS
          ============================== */

          securityDeposit:
            0,

          totalEarnings:
            0,

          todayEarnings:
            0,

          totalWithdrawals:
            0,

          /* ==============================
             BOOKING TOTALS
          ============================== */

          totalBookings:
            0,

          completedBookings:
            0,

          cancelledBookings:
            0,

          averageRating:
            5,

          completedRideDistance:
            0,

          /* ==============================
             SAFETY
          ============================== */

          blacklisted:
            false,

          notificationsEnabled:
            true,

          locationPermission:
            false,

          isDeleted:
            false,
        });
    } catch (error) {
      console.error(
        "RIDER CREATION ERROR:",
        error
      );

      /*
       * A second request may have passed
       * the duplicate lookup at exactly
       * the same time.
       *
       * MongoDB unique indexes remain the
       * final protection.
       */

      if (
        isDuplicateKeyError(error)
      ) {
        return NextResponse.json(
          {
            success: false,
            errorCode:
              "DUPLICATE_RIDER",
            message:
              "A rider with the same phone, email, Aadhaar, driving license or Firebase account already exists.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    /* =====================================================
       CREATE WALLET
       
       Every new rider must have exactly one
       wallet.
    ===================================================== */

    try {
      await ensureRiderWallet(
        {
          _id: rider._id,
          riderId: rider.riderId,
          fullName: rider.fullName,
          phone: rider.phone,
          approvalStatus:
            rider.approvalStatus,
          kycStatus: rider.kycStatus,
          status: rider.status,
          bookingEnabled:
            rider.bookingEnabled,
          blacklisted:
            rider.blacklisted,
        },
        "System"
      );
    } catch (walletError) {
      console.error(
        "WALLET CREATION FAILED — ROLLING BACK RIDER:",
        walletError
      );

      /*
       * Do not intentionally leave a new rider
       * without a wallet.
       */

      try {
        await Rider.deleteOne({
          _id: rider._id,
        });
      } catch (rollbackError) {
        console.error(
          "RIDER ROLLBACK FAILED:",
          rollbackError
        );
      }

      if (
        walletError instanceof
        RiderWalletError
      ) {
        return NextResponse.json(
          {
            success: false,
            errorCode:
              walletError.code,
            message:
              walletError.message,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          errorCode:
            "WALLET_CREATION_FAILED",
          message:
            "Registration could not be completed because the rider wallet could not be created.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        errorCode:
          "REGISTRATION_SUCCESS",

        message:
          "Rider Registered Successfully",

        data:
          safeRiderResponse({
            riderId:
              rider.riderId,

            fullName:
              rider.fullName,

            phone:
              rider.phone,

            approvalStatus:
              rider.approvalStatus,

            kycStatus:
              rider.kycStatus,

            status:
              rider.status,

            bookingEnabled:
              rider.bookingEnabled,
          }),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "================================================"
    );

    console.error(
      "RIDER REGISTRATION ERROR"
    );

    console.error(
      "Created Rider ID:",
      createdRiderId
    );

    console.error(error);

    console.error(
      "================================================"
    );

    /* =====================================================
       MONGOOSE VALIDATION ERROR
    ===================================================== */

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "VALIDATION_ERROR",

          message:
            error.message,

          errors:
            Object.values(
              error.errors
            ).map(
              (item) =>
                item.message
            ),
        },
        { status: 400 }
      );
    }

    /* =====================================================
       DUPLICATE KEY
    ===================================================== */

    if (
      isDuplicateKeyError(error)
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "DUPLICATE_RIDER",

          message:
            "A rider with the same phone, email, Aadhaar, driving license or Firebase account already exists.",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       UNKNOWN ERROR
    ===================================================== */

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "REGISTRATION_ERROR",

        message:
          process.env.NODE_ENV ===
          "development"
            ? message
            : "Unable to complete rider registration. Please try again.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   EXISTING RIDER RESPONSE
========================================================= */

function buildExistingRiderResponse(
  rider: ExistingRiderRecord,
  field: string
) {
  /* =======================================================
     FULLY APPROVED
  ======================================================= */

  const fullyApproved =
    rider.approvalStatus ===
      "Approved" &&
    rider.kycStatus ===
      "Approved" &&
    rider.status ===
      "Active" &&
    rider.bookingEnabled ===
      true &&
    rider.blacklisted !== true;

  if (fullyApproved) {
    return NextResponse.json(
      {
        success: false,

        riderExists: true,

        riderStatus:
          "Approved",

        riderId:
          rider.riderId,

        bookingEnabled:
          true,

        redirectTo:
          "/ride-options",

        errorCode:
          "RIDER_ALREADY_APPROVED",

        field,

        message:
          "Your account is already approved. Continue to Book Bike.",
      },
      { status: 409 }
    );
  }

  /* =======================================================
     UNDER REVIEW
  ======================================================= */

  if (
    rider.approvalStatus ===
      "Under Review" ||
    rider.kycStatus ===
      "Pending"
  ) {
    return NextResponse.json(
      {
        success: false,

        riderExists: true,

        riderStatus:
          "Under Review",

        riderId:
          rider.riderId,

        bookingEnabled:
          false,

        errorCode:
          "RIDER_UNDER_REVIEW",

        field,

        message:
          "Your KYC verification is under review.",
      },
      { status: 409 }
    );
  }

  /* =======================================================
     REJECTED
  ======================================================= */

  if (
    rider.approvalStatus ===
      "Rejected" ||
    rider.kycStatus ===
      "Rejected"
  ) {
    return NextResponse.json(
      {
        success: false,

        riderExists: true,

        riderStatus:
          "Rejected",

        riderId:
          rider.riderId,

        bookingEnabled:
          false,

        errorCode:
          "RIDER_REJECTED",

        field,

        message:
          clean(
            rider.rejectedReason
          ) ||
          "Your previous registration was rejected. Please contact support.",
      },
      { status: 409 }
    );
  }

  /* =======================================================
     SUSPENDED / BLOCKED / OTHER RESTRICTED STATE
  ======================================================= */

  return NextResponse.json(
    {
      success: false,

      riderExists: true,

      riderId:
        rider.riderId,

      riderStatus:
        rider.approvalStatus,

      bookingEnabled:
        false,

      errorCode:
        "RIDER_RESTRICTED",

      field,

      message:
        "Your rider account already exists but is currently restricted. Please contact support.",
    },
    { status: 409 }
  );
}

/* =========================================================
   GET
   RIDER LOOKUP / ADMIN RIDER DIRECTORY
========================================================= */

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const phone =
      normalizePhone(
        searchParams.get("phone")
      );

    /* =====================================================
       RIDER LOOKUP BY PHONE
    ===================================================== */

    if (phone) {
      if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json(
          {
            success: false,

            errorCode:
              "INVALID_PHONE",

            message:
              "Invalid phone number.",
          },
          { status: 400 }
        );
      }

      const rider =
  await Rider.findOne({
    phone,
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  })
          .select(
            [
              "riderId",
              "fullName",
              "phone",
              "email",
              "firebaseUid",
              "approvalStatus",
              "kycStatus",
              "phoneVerified",
              "bookingEnabled",
              "blacklisted",
              "status",
              "rejectedReason",
            ].join(" ")
          )
          .lean<{
            riderId: string;

            fullName: string;

            phone: string;

            email?: string;

            firebaseUid?: string;

            approvalStatus: string;

            kycStatus: string;

            phoneVerified: boolean;

            bookingEnabled: boolean;

            blacklisted: boolean;

            status: string;

            rejectedReason?: string;
          } | null>();

      if (!rider) {
        return NextResponse.json(
          {
            success: false,

            errorCode:
              "RIDER_NOT_FOUND",

            message:
              "Rider not found.",
          },
          { status: 404 }
        );
      }

      /* ===================================================
         ADMIN CHECK
      =================================================== */

      const isAdmin =
        await isAdminAuthenticated()
          .catch(() => false);

      /* ===================================================
         NORMAL RIDER OWNERSHIP CHECK
      =================================================== */

      if (!isAdmin) {
        const firebaseUser =
          await getVerifiedFirebaseUser(
            req
          );

        if (
          !firebaseUserOwnsRider(
            firebaseUser,
            rider
          )
        ) {
          return unauthorizedResponse();
        }
      }

      /*
       * Firebase UID must never be returned
       * to the browser.
       */

      const {
        firebaseUid,
        ...safeRider
      } = rider;

      void firebaseUid;

      return NextResponse.json({
        success: true,

        data: safeRider,
      });
    }

    /* =====================================================
       ADMIN RIDER DIRECTORY
    ===================================================== */

    const isAdmin =
      await isAdminAuthenticated()
        .catch(() => false);

    if (!isAdmin) {
      return unauthorizedResponse();
    }

    /* =====================================================
       FETCH RIDERS
    ===================================================== */

    const riders =
  await Rider.find({
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  })
        .select(
          [
            "riderId",
            "fullName",
            "phone",
            "email",
            "kycStatus",
            "approvalStatus",
            "status",
            "bookingEnabled",
            "activeRide",
            "blacklisted",
            "aadhaarFrontUrl",
            "aadhaarBackUrl",
            "licenseFrontUrl",
            "licenseBackUrl",
            "profilePhotoUrl",
            "createdAt",
            "updatedAt",
          ].join(" ")
        )
        .sort({
          createdAt:
            -1,
        })
        .limit(300)
        .lean<AdminRiderRecord[]>();

    /* =====================================================
       FETCH WALLETS
    ===================================================== */

    const riderIds =
      riders.map(
        (rider) =>
          rider.riderId
      );

    const wallets =
      riderIds.length > 0
        ? await Wallet.find({
            riderId: {
              $in: riderIds,
            },
            $or: [
              { isDeleted: false },
              { isDeleted: { $exists: false } },
            ],
          })
            .select(
              "riderId balance status"
            )
            .lean<WalletAdminRecord[]>()
        : [];

    /* =====================================================
       WALLET MAP
    ===================================================== */

    const walletMap =
      new Map<
        string,
        {
          balance: number;

          status:
            | "Active"
            | "Blocked";
        }
      >(
        wallets.map(
          (wallet) => [
            wallet.riderId,

            {
              balance:
                Number(
                  wallet.balance ??
                    0
                ),

              status:
                wallet.status ??
                "Blocked",
            },
          ]
        )
      );

    /* =====================================================
       MERGE RIDER + WALLET
    ===================================================== */

    const data =
      riders.map(
        (rider) => {
          const wallet =
            walletMap.get(
              rider.riderId
            );

          return {
            ...rider,

            walletBalance:
              wallet?.balance ??
              0,

            walletStatus:
              wallet?.status ??
              "Blocked",
          };
        }
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      data,
    });
  } catch (error: unknown) {
    console.error(
      "GET RIDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "RIDERS_FETCH_ERROR",

        message:
          "Unable to fetch rider records.",
      },
      { status: 500 }
    );
  }
}