import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";
import Counter from "@/models/Counter";

import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

/* =========================================================
   VALIDATION
========================================================= */

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]{2,79}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AADHAAR_REGEX = /^\d{12}$/;
const DRIVING_LICENSE_REGEX = /^[A-Z]{2}\d{2}\d{11}$/;
const RIDER_ID_REGEX = /^RDR-\d{6,}$/;

/* =========================================================
   HELPERS
========================================================= */

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizePhone(value: unknown): string {
  const digits = clean(value).replace(/\D/g, "");

  if (!digits) return "";

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits.length === 10 ? digits : digits.slice(-10);
}

function normalizeLicense(value: unknown): string | undefined {
  const license = clean(value).toUpperCase().replace(/\s/g, "");
  return license || undefined;
}

function optionalString(value: unknown): string | undefined {
  const valueClean = clean(value);
  return valueClean || undefined;
}

function optionalPhone(value: unknown): string | undefined {
  const phone = normalizePhone(value);
  return phone || undefined;
}

function isSafeCloudinaryUrl(value: unknown): boolean {
  if (!value) return false;

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

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    Number((error as { code?: unknown }).code) === 11000
  );
}

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
    approvalStatus: rider.approvalStatus,
    kycStatus: rider.kycStatus,
    status: rider.status,
    bookingEnabled: rider.bookingEnabled,
  };
}

function validationResponse(errors: string[]) {
  return NextResponse.json(
    {
      success: false,
      errorCode: "VALIDATION_ERROR",
      errors,
      message: errors.join(" "),
    },
    { status: 400 }
  );
}


type RiderLookupRecord = {
  riderId: string;
  fullName: string;
  phone: string;
  email?: string;
  firebaseUid?: string;
  approvalStatus: string;
  kycStatus: string;
  phoneVerified?: boolean;
  bookingEnabled: boolean;
  blacklisted: boolean;
  status: string;
  rejectedReason?: string;
  activeRide?: boolean;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  profilePhotoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/* =========================================================
   POST — RIDER REGISTRATION

   Business rules:
   - Firebase OTP verification is mandatory.
   - Firebase UID + Firebase phone are authoritative.
   - Driving licence NUMBER is optional.
   - Driving licence documents are optional.
   - Aadhaar front/back and profile photo are required.
   - A new Rider always receives exactly one Wallet.
   - New Rider starts Under Review / Pending / Blocked.
   - If Wallet creation fails, the newly-created Rider is removed.
========================================================= */

export async function POST(req: Request) {
  let createdRiderId: string | null = null;

  try {
    await connectDB();

    /* -----------------------------------------------------
       BODY
    ----------------------------------------------------- */
    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_JSON",
          message: "Invalid registration request.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       NORMALIZE INPUT
    ----------------------------------------------------- */
    const fullName = clean(body.fullName);
    const phone = normalizePhone(body.phone);
    const email = clean(body.email).toLowerCase();
    const aadhaarNumber = clean(body.aadhaarNumber);

    // IMPORTANT: optional. Empty value becomes undefined.
    const drivingLicense = normalizeLicense(body.drivingLicense);

    // Support both the existing JSON-body token and Authorization header.
    const explicitFirebaseToken = clean(body.firebaseIdToken);

    const emergencyContactName = optionalString(body.emergencyContactName);
    const emergencyContactPhone = optionalPhone(body.emergencyContactPhone);

    const reference1Name = optionalString(body.reference1Name);
    const reference1Phone = optionalPhone(body.reference1Phone);

    const reference2Name = optionalString(body.reference2Name);
    const reference2Phone = optionalPhone(body.reference2Phone);

    const instagramId = optionalString(body.instagramId);
    const facebookId = optionalString(body.facebookId);

    const aadhaarFrontUrl = clean(body.aadhaarFrontUrl);
    const aadhaarBackUrl = clean(body.aadhaarBackUrl);
    const licenseFrontUrl = clean(body.licenseFrontUrl);
    const licenseBackUrl = clean(body.licenseBackUrl);
    const profilePhotoUrl = clean(body.profilePhotoUrl);

    /* -----------------------------------------------------
       BASIC VALIDATION
    ----------------------------------------------------- */
    const errors: string[] = [];

    if (!fullName || !NAME_REGEX.test(fullName)) {
      errors.push("Enter a valid full name.");
    }

    if (!PHONE_REGEX.test(phone)) {
      errors.push("Enter a valid Indian mobile number.");
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push("Enter a valid email address.");
    }

    if (!AADHAAR_REGEX.test(aadhaarNumber)) {
      errors.push("Aadhaar number must be exactly 12 digits.");
    }

    // Driving licence remains OPTIONAL.
    if (drivingLicense && !DRIVING_LICENSE_REGEX.test(drivingLicense)) {
      errors.push("Enter a valid driving license number.");
    }

    if (
      emergencyContactPhone &&
      !PHONE_REGEX.test(emergencyContactPhone)
    ) {
      errors.push("Emergency contact phone number is invalid.");
    }

    if (reference1Phone && !PHONE_REGEX.test(reference1Phone)) {
      errors.push("Reference 1 phone number is invalid.");
    }

    if (reference2Phone && !PHONE_REGEX.test(reference2Phone)) {
      errors.push("Reference 2 phone number is invalid.");
    }

    if (reference1Name && !NAME_REGEX.test(reference1Name)) {
      errors.push("Reference Person 1 name is invalid.");
    }

    if (reference2Name && !NAME_REGEX.test(reference2Name)) {
      errors.push("Reference Person 2 name is invalid.");
    }

    /* -----------------------------------------------------
       REQUIRED DOCUMENTS
    ----------------------------------------------------- */
    if (!aadhaarFrontUrl) {
      errors.push("Aadhaar Front is required.");
    }

    if (!aadhaarBackUrl) {
      errors.push("Aadhaar Back is required.");
    }

    if (!profilePhotoUrl) {
      errors.push("Profile photo is required.");
    }

    /* -----------------------------------------------------
       DOCUMENT URL VALIDATION

       License documents are OPTIONAL.
       If supplied, they must be Cloudinary HTTPS URLs.
    ----------------------------------------------------- */
    const documents = [
      { label: "Aadhaar Front", url: aadhaarFrontUrl, required: true },
      { label: "Aadhaar Back", url: aadhaarBackUrl, required: true },
      { label: "Driving License Front", url: licenseFrontUrl, required: false },
      { label: "Driving License Back", url: licenseBackUrl, required: false },
      { label: "Profile Photo", url: profilePhotoUrl, required: true },
    ];

    for (const document of documents) {
      if (!document.url) {
        if (document.required) {
          errors.push(`${document.label} is required.`);
        }
        continue;
      }

      if (!isSafeCloudinaryUrl(document.url)) {
        errors.push(
          `${document.label} must be uploaded through the approved document upload service.`
        );
      }
    }

    /* -----------------------------------------------------
       DOCUMENT DUPLICATE PROTECTION
    ----------------------------------------------------- */
    if (aadhaarFrontUrl && aadhaarFrontUrl === aadhaarBackUrl) {
      errors.push("Aadhaar Front and Aadhaar Back cannot be the same file.");
    }

    if (licenseFrontUrl && licenseFrontUrl === licenseBackUrl) {
      errors.push(
        "Driving License Front and Driving License Back cannot be the same file."
      );
    }

    if (
      aadhaarFrontUrl &&
      licenseFrontUrl &&
      aadhaarFrontUrl === licenseFrontUrl
    ) {
      errors.push("Aadhaar and Driving License cannot use the same document.");
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

    if (errors.length > 0) {
      return validationResponse(errors);
    }

    /* -----------------------------------------------------
       FIREBASE VERIFICATION

       The helper checks:
       - Authorization: Bearer <token>, OR
       - explicit body.firebaseIdToken

       Firebase remains the source of truth.
    ----------------------------------------------------- */
    const firebaseUser = await getVerifiedFirebaseUser(
      req,
      explicitFirebaseToken || undefined
    );

    if (!firebaseUser) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_FIREBASE_TOKEN",
          message:
            "Invalid or expired Firebase verification. Please verify OTP again.",
        },
        { status: 401 }
      );
    }

    const verifiedPhone = normalizePhone(firebaseUser.phone);

    if (!verifiedPhone) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "FIREBASE_PHONE_MISSING",
          message:
            "Firebase did not provide a verified phone number. Please verify OTP again.",
        },
        { status: 401 }
      );
    }

    if (verifiedPhone !== phone) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "PHONE_MISMATCH",
          message:
            "The verified phone number does not match the registration phone number.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       DUPLICATE RIDER CHECK

       Driving licence participates ONLY when supplied.
    ----------------------------------------------------- */
    const duplicateQuery: Record<string, unknown>[] = [
      { phone },
      { email },
      { aadhaarNumber },
      { firebaseUid: firebaseUser.uid },
    ];

    if (drivingLicense) {
      duplicateQuery.push({ drivingLicense });
    }

    const existingRider = await Rider.findOne({
      isDeleted: false,
      $or: duplicateQuery,
    })
      .select(
        [
          "riderId",
          "fullName",
          "phone",
          "approvalStatus",
          "kycStatus",
          "status",
          "bookingEnabled",
          "blacklisted",
          "rejectedReason",
          "firebaseUid",
          "isDeleted",
        ].join(" ")
      )
      .lean<RiderLookupRecord | null>();

    /* -----------------------------------------------------
       EXISTING RIDER BEHAVIOUR
    ----------------------------------------------------- */
    if (existingRider) {
      const fullyApproved =
        existingRider.approvalStatus === "Approved" &&
        existingRider.kycStatus === "Approved" &&
        existingRider.status === "Active" &&
        existingRider.bookingEnabled === true &&
        existingRider.blacklisted !== true;

      if (fullyApproved) {
        return NextResponse.json(
          {
            success: false,
            riderExists: true,
            riderStatus: "Approved",
            riderId: existingRider.riderId,
            bookingEnabled: true,
            redirectTo: "/book-bike",
            message:
              "Your account is already approved. Continue to Book Bike.",
          },
          { status: 409 }
        );
      }

      if (
        existingRider.approvalStatus === "Under Review" ||
        existingRider.kycStatus === "Pending"
      ) {
        return NextResponse.json(
          {
            success: false,
            riderExists: true,
            riderStatus: "Under Review",
            riderId: existingRider.riderId,
            bookingEnabled: false,
            message: "Your KYC verification is under review.",
          },
          { status: 409 }
        );
      }

      if (
        existingRider.approvalStatus === "Rejected" ||
        existingRider.kycStatus === "Rejected"
      ) {
        return NextResponse.json(
          {
            success: false,
            riderExists: true,
            riderStatus: "Rejected",
            riderId: existingRider.riderId,
            bookingEnabled: false,
            message:
              clean(existingRider.rejectedReason) ||
              "Your previous registration was rejected. Please contact support.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          riderExists: true,
          riderId: existingRider.riderId,
          riderStatus: existingRider.approvalStatus,
          bookingEnabled: false,
          message:
            "Your rider account already exists but is currently restricted. Please contact support.",
        },
        { status: 409 }
      );
    }

    /* -----------------------------------------------------
       GENERATE RIDER ID

       Counter gaps are acceptable. The counter is intentionally
       not rolled back if a later operation fails.
    ----------------------------------------------------- */
    const counter = await Counter.findByIdAndUpdate(
      "riderSequence",
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!counter) {
      throw new Error("Failed to generate Rider ID.");
    }

    const riderId = `RDR-${String(counter.seq).padStart(6, "0")}`;
    createdRiderId = riderId;

    /* -----------------------------------------------------
       CREATE RIDER
    ----------------------------------------------------- */
    let rider;

    try {
      rider = await Rider.create({
        riderId,
        fullName,
        phone,
        email,
        aadhaarNumber,

        // OPTIONAL — never force a licence value.
        drivingLicense,

        aadhaarFrontUrl,
        aadhaarBackUrl,
        licenseFrontUrl: licenseFrontUrl || undefined,
        licenseBackUrl: licenseBackUrl || undefined,
        profilePhotoUrl,

        emergencyContactName,
        emergencyContactPhone,
        reference1Name,
        reference1Phone,
        reference2Name,
        reference2Phone,
        instagramId,
        facebookId,

        // SERVER-AUTHORITATIVE FIREBASE DATA
        firebaseUid: firebaseUser.uid,
        verifiedPhoneNumber:
          firebaseUser.decodedToken.phone_number || `+91${phone}`,
        phoneVerified: true,
        lastOtpVerifiedAt: new Date(),

        // INITIAL ONBOARDING STATE
        approvalStatus: "Under Review",
        kycStatus: "Pending",
        status: "Blocked",
        bookingEnabled: false,
        activeRide: false,

        // WALLET / EARNINGS DEFAULTS
        securityDeposit: 0,
        totalEarnings: 0,
        todayEarnings: 0,
        totalWithdrawals: 0,
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageRating: 5,
        completedRideDistance: 0,

        blacklisted: false,
        notificationsEnabled: true,
        locationPermission: false,
        isDeleted: false,
      });

    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          {
            success: false,
            errorCode: "DUPLICATE_RIDER",
            message:
              "A rider with the same phone, email, Aadhaar, driving license or Firebase account already exists.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    /* -----------------------------------------------------
       CREATE WALLET

       This is server-controlled. The client cannot supply:
       balance, riderId, userId, phone, or wallet status.
    ----------------------------------------------------- */
    try {
      await Wallet.create({
        riderId: rider.riderId,
        userId: rider._id,
        userName: rider.fullName,
        phone: rider.phone,
        balance: 0,
        securityDepositHold: 0,
        freezeAmount: 0,
        totalRecharge: 0,
        totalSpent: 0,
        totalRefund: 0,
        status: "Blocked",
        adminBlocked: false,
        isDeleted: false,
        updatedBy: "System",
      });
    } catch (walletError) {
      console.error("WALLET CREATION FAILED:", walletError);

      // Never intentionally leave a newly-created rider without its wallet.
      try {
        await Rider.deleteOne({ _id: rider._id });
      } catch (rollbackError) {
        console.error("RIDER ROLLBACK FAILED:", rollbackError);
      }

      if (isDuplicateKeyError(walletError)) {
        return NextResponse.json(
          {
            success: false,
            errorCode: "WALLET_ALREADY_EXISTS",
            message:
              "Wallet creation encountered an existing wallet record. Registration was not completed.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          errorCode: "WALLET_CREATION_FAILED",
          message:
            "Wallet could not be created, so the rider registration was not completed. Please try again.",
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */
    return NextResponse.json(
      {
        success: true,
        message: "Rider Registered Successfully",
        data: safeRiderResponse({
          riderId: rider.riderId,
          fullName: rider.fullName,
          phone: rider.phone,
          approvalStatus: rider.approvalStatus,
          kycStatus: rider.kycStatus,
          status: rider.status,
          bookingEnabled: rider.bookingEnabled,
        }),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("================================================");
    console.error("RIDER REGISTRATION ERROR");
    console.error("Created Rider ID:", createdRiderId);
    console.error(error);
    console.error("================================================");

    if (error instanceof Error && error.name === "ValidationError") {
      const mongooseErrors = (
        error as unknown as {
          errors?: Record<string, { message: string }>;
        }
      ).errors || {};

      const errors = Object.values(mongooseErrors).map(
        (item) => item.message
      );

      return NextResponse.json(
        {
          success: false,
          errorCode: "VALIDATION_ERROR",
          message: errors.join(" ") || error.message,
          errors,
        },
        { status: 400 }
      );
    }

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "DUPLICATE_RIDER",
          message:
            "A rider with the same phone, email, Aadhaar, driving license or Firebase account already exists.",
        },
        { status: 409 }
      );
    }

    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "REGISTRATION_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? message
            : "Unable to complete rider registration. Please try again.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET — RIDER LOOKUP / ADMIN RIDER DIRECTORY
========================================================= */

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = normalizePhone(searchParams.get("phone"));

    /* -----------------------------------------------------
       LOOKUP BY PHONE
    ----------------------------------------------------- */
    if (phone) {
      if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid phone number.",
          },
          { status: 400 }
        );
      }

      const rider = await Rider.findOne({
        phone,
        isDeleted: false,
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
            message: "Rider not found.",
          },
          { status: 404 }
        );
      }

      const isAdmin = await isAdminAuthenticated().catch(() => false);

      if (!isAdmin) {
        const firebaseUser = await getVerifiedFirebaseUser(req);

        if (!firebaseUserOwnsRider(firebaseUser, rider)) {
          return unauthorizedResponse();
        }
      }

      const { firebaseUid: _firebaseUid, ...safeRider } = rider;
      void _firebaseUid;

      return NextResponse.json({
        success: true,
        data: safeRider,
      });
    }

    /* -----------------------------------------------------
       ADMIN DIRECTORY
    ----------------------------------------------------- */
    const isAdmin = await isAdminAuthenticated().catch(() => false);

    if (!isAdmin) {
      return unauthorizedResponse();
    }

    const riders = await Rider.find({
      isDeleted: false,
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
          "aadhaarFrontUrl",
          "aadhaarBackUrl",
          "licenseFrontUrl",
          "licenseBackUrl",
          "profilePhotoUrl",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .sort({ createdAt: -1 })
      .lean<RiderLookupRecord[]>();

    const riderIds = riders.map((rider) => rider.riderId);

    const wallets =
      riderIds.length > 0
        ? await Wallet.find({
            riderId: { $in: riderIds },
            isDeleted: false,
          })
            .select("riderId balance status")
            .lean()
        : [];

    const walletMap = new Map(
      wallets.map((wallet) => [
        wallet.riderId,
        {
          balance: Number(wallet.balance || 0),
          status: wallet.status,
        },
      ])
    );

    const data = riders.map((rider) => {
      const wallet = walletMap.get(rider.riderId);

      return {
        ...rider,
        walletBalance: wallet?.balance ?? 0,
        walletStatus: wallet?.status ?? "Blocked",
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("GET RIDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch rider records.",
      },
      { status: 500 }
    );
  }
}