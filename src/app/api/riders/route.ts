import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";
import Counter from "@/models/Counter";
import { adminAuth } from "@/lib/firebaseAdmin";
import mongoose from "mongoose";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";

export const runtime = "nodejs";

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const aadhaarRegex = /^\d{12}$/;
const drivingLicenseRegex = /^[A-Z]{2}\d{2}\d{11}$/;

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizePhone(value: unknown): string {
  return clean(value).replace(/\D/g, "").slice(-10);
}

function normalizeLicense(value: unknown): string {
  return clean(value).toUpperCase().replace(/\s/g, "");
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

/* =========================================================
   POST — RIDER REGISTRATION
========================================================= */

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    const body = await req.json();

    /*
     * =========================================================
     * NORMALIZE INPUT
     * =========================================================
     */

    const fullName = clean(body.fullName);
    const phone = normalizePhone(body.phone);
    const email = clean(body.email).toLowerCase();

    const aadhaarNumber = clean(body.aadhaarNumber);

    const drivingLicense = normalizeLicense(
      body.drivingLicense
    );

    const firebaseIdToken = clean(
      body.firebaseIdToken
    );

    /*
     * Optional fields.
     *
     * IMPORTANT:
     * Empty optional values become undefined rather than "".
     * This prevents Mongoose minlength validation from
     * rejecting optional phone fields.
     */

    const emergencyContactName =
      clean(body.emergencyContactName) || undefined;

    const emergencyContactPhone =
      normalizePhone(body.emergencyContactPhone) || undefined;

    const reference1Name =
      clean(body.reference1Name) || undefined;

    const reference1Phone =
      normalizePhone(body.reference1Phone) || undefined;

    const reference2Name =
      clean(body.reference2Name) || undefined;

    const reference2Phone =
      normalizePhone(body.reference2Phone) || undefined;

    const instagramId =
      clean(body.instagramId) || undefined;

    const facebookId =
      clean(body.facebookId) || undefined;

    /*
     * Documents
     */

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

    /*
     * =========================================================
     * BASIC VALIDATION
     * =========================================================
     */

    const errors: string[] = [];

    if (!firebaseIdToken) {
      errors.push(
        "Phone OTP verification is required."
      );
    }

    if (!nameRegex.test(fullName)) {
      errors.push(
        "Enter a valid full name."
      );
    }

    if (!phoneRegex.test(phone)) {
      errors.push(
        "Enter a valid Indian mobile number."
      );
    }

    if (!emailRegex.test(email)) {
      errors.push(
        "Enter a valid email address."
      );
    }

    if (!aadhaarRegex.test(aadhaarNumber)) {
      errors.push(
        "Aadhaar number must be exactly 12 digits."
      );
    }

    /*
     * Driving licence is optional.
     */

    if (
      drivingLicense &&
      !drivingLicenseRegex.test(drivingLicense)
    ) {
      errors.push(
        "Enter a valid driving license number."
      );
    }

    /*
     * =========================================================
     * OPTIONAL PHONE VALIDATION
     * =========================================================
     */

    if (
      emergencyContactPhone &&
      !phoneRegex.test(
        emergencyContactPhone
      )
    ) {
      errors.push(
        "Emergency contact phone number is invalid."
      );
    }

    if (
      reference1Phone &&
      !phoneRegex.test(
        reference1Phone
      )
    ) {
      errors.push(
        "Reference 1 phone number is invalid."
      );
    }

    if (
      reference2Phone &&
      !phoneRegex.test(
        reference2Phone
      )
    ) {
      errors.push(
        "Reference 2 phone number is invalid."
      );
    }

    /*
     * =========================================================
     * REQUIRED DOCUMENTS
     * =========================================================
     */

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

    /*
     * =========================================================
     * CLOUDINARY URL VALIDATION
     * =========================================================
     */

    const documentUrls: Array<
      [string, string, boolean]
    > = [
      [
        "Aadhaar Front",
        aadhaarFrontUrl,
        true,
      ],
      [
        "Aadhaar Back",
        aadhaarBackUrl,
        true,
      ],
      [
        "Driving License Front",
        licenseFrontUrl,
        false,
      ],
      [
        "Driving License Back",
        licenseBackUrl,
        false,
      ],
      [
        "Profile Photo",
        profilePhotoUrl,
        true,
      ],
    ];

    for (
      const [label, url, required] of documentUrls
    ) {
      if (!url && !required) {
        continue;
      }

      if (
        url &&
        !isSafeCloudinaryUrl(url)
      ) {
        errors.push(
          `${label} must be uploaded through the approved document upload service.`
        );
      }
    }

    /*
     * =========================================================
     * DUPLICATE DOCUMENT PROTECTION
     * =========================================================
     */

    if (
      aadhaarFrontUrl &&
      aadhaarBackUrl &&
      aadhaarFrontUrl === aadhaarBackUrl
    ) {
      errors.push(
        "Aadhaar Front and Aadhaar Back cannot be the same file."
      );
    }

    if (
      licenseFrontUrl &&
      licenseBackUrl &&
      licenseFrontUrl === licenseBackUrl
    ) {
      errors.push(
        "Driving License Front and Driving License Back cannot be the same file."
      );
    }

    if (
      aadhaarFrontUrl &&
      licenseFrontUrl &&
      aadhaarFrontUrl === licenseFrontUrl
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

    /*
     * =========================================================
     * REFERENCE NAME VALIDATION
     * =========================================================
     */

    if (
      reference1Name &&
      !nameRegex.test(reference1Name)
    ) {
      errors.push(
        "Reference Person 1 name is invalid."
      );
    }

    if (
      reference2Name &&
      !nameRegex.test(reference2Name)
    ) {
      errors.push(
        "Reference Person 2 name is invalid."
      );
    }

    if (errors.length > 0) {
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

    /*
     * =========================================================
     * VERIFY FIREBASE ID TOKEN
     * =========================================================
     */

    let decodedToken;

    try {
      decodedToken =
        await adminAuth.verifyIdToken(
          firebaseIdToken
        );
    } catch {
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

    if (!decodedToken.uid) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_FIREBASE_ACCOUNT",
          message:
            "Invalid Firebase account.",
        },
        { status: 401 }
      );
    }

    /*
     * Firebase Phone Auth gives us the authoritative
     * verified phone number.
     */

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
          errorCode: "PHONE_MISMATCH",
          message:
            "The verified phone number does not match the registration phone number.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * START TRANSACTION
     *
     * Rider + Counter + Wallet are one unit.
     * =========================================================
     */

    session =
      await mongoose.startSession();

    session.startTransaction();

    try {
      /*
       * =======================================================
       * DUPLICATE RIDER CHECK
       * =======================================================
       */

      const duplicateChecks: Record<
        string,
        string
      >[] = [
        { phone },
        { email },
        { aadhaarNumber },
        {
          firebaseUid:
            decodedToken.uid,
        },
      ];

      /*
       * IMPORTANT:
       * Do NOT put an empty drivingLicense
       * into the duplicate query.
       */

      if (drivingLicense) {
        duplicateChecks.push({
          drivingLicense,
        });
      }

      const existingRider =
        await Rider.findOne({
          isDeleted: false,
          $or: duplicateChecks,
        }).session(session);

      if (existingRider) {
        await session.abortTransaction();

        /*
         * Already fully approved.
         */

        if (
          existingRider.approvalStatus ===
            "Approved" &&
          existingRider.kycStatus ===
            "Approved" &&
          existingRider.status ===
            "Active" &&
          existingRider.bookingEnabled ===
            true &&
          existingRider.blacklisted !==
            true
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus: "Approved",
              riderId:
                existingRider.riderId,
              message:
                "Your account is already approved. Please continue to Book Bike.",
            },
            { status: 409 }
          );
        }

        /*
         * Under review.
         */

        if (
          existingRider.approvalStatus ===
            "Under Review" ||
          existingRider.kycStatus ===
            "Pending"
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus:
                "Under Review",
              riderId:
                existingRider.riderId,
              message:
                "Your KYC verification is under review.",
            },
            { status: 409 }
          );
        }

        /*
         * Rejected.
         */

        if (
          existingRider.approvalStatus ===
            "Rejected" ||
          existingRider.kycStatus ===
            "Rejected"
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus: "Rejected",
              riderId:
                existingRider.riderId,
              message:
                existingRider.rejectedReason ||
                "Your previous registration was rejected. Please contact support.",
            },
            { status: 409 }
          );
        }

        /*
         * Suspended / blocked / other existing state.
         */

        return NextResponse.json(
          {
            success: false,
            riderExists: true,
            riderId:
              existingRider.riderId,
            riderStatus:
              existingRider.approvalStatus,
            message:
              "A rider account with this information already exists.",
          },
          { status: 409 }
        );
      }

      /*
       * =======================================================
       * GENERATE RIDER ID
       * =======================================================
       */

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
            session,
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

      /*
       * =======================================================
       * CREATE RIDER
       * =======================================================
       */

      const riderDocs =
        await Rider.create(
          [
            {
              riderId,

              fullName,
              phone,
              email,

              aadhaarNumber,

              /*
               * Undefined means the optional field
               * is not stored as an empty string.
               */
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

              emergencyContactName,
              emergencyContactPhone,

              reference1Name,
              reference1Phone,

              reference2Name,
              reference2Phone,

              instagramId,
              facebookId,

              /*
               * SERVER AUTHORITATIVE
               */

              firebaseUid:
                decodedToken.uid,

              verifiedPhoneNumber:
                decodedToken.phone_number ||
                `+91${phone}`,

              phoneVerified: true,

              lastOtpVerifiedAt:
                new Date(),

              /*
               * Initial onboarding state.
               */

              approvalStatus:
                "Under Review",

              kycStatus:
                "Pending",

              status:
                "Blocked",

              bookingEnabled:
                false,

              activeRide:
                false,

              securityDeposit: 0,

              blacklisted:
                false,

              notificationsEnabled:
                true,
            },
          ],
          {
            session,
          }
        );

      const rider =
        riderDocs[0];

      /*
       * =======================================================
       * CREATE WALLET
       * =======================================================
       */

      const existingWallet =
        await Wallet.findOne({
          riderId:
            rider.riderId,
        }).session(session);

      if (existingWallet) {
        throw new Error(
          "Wallet already exists for newly created rider."
        );
      }

      await Wallet.create(
        [
          {
            riderId:
              rider.riderId,

            userId:
              rider._id,

            userName:
              rider.fullName,

            phone:
              rider.phone,

            balance: 0,

            securityDepositHold:
              0,

            freezeAmount:
              0,

            totalRecharge:
              0,

            totalSpent:
              0,

            totalRefund:
              0,

            /*
             * New rider cannot book until
             * admin approval.
             */

            status:
              "Blocked",

            isDeleted:
              false,
          },
        ],
        {
          session,
        }
      );

      /*
       * =======================================================
       * COMMIT
       * =======================================================
       */

      await session.commitTransaction();

      /*
       * =======================================================
       * SAFE RESPONSE
       * =======================================================
       */

      return NextResponse.json(
        {
          success: true,

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

    } catch (transactionError) {
      try {
        await session.abortTransaction();
      } catch {}

      throw transactionError;

    } finally {
      await session.endSession();
      session = null;
    }

  } catch (error: unknown) {

    console.error(
      "RIDER REGISTRATION ERROR:",
      error
    );

    /*
     * =========================================================
     * MONGOOSE VALIDATION ERROR
     * =========================================================
     */

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );

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

    /*
     * =========================================================
     * DUPLICATE KEY
     * =========================================================
     */

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      Number(
        (error as { code?: unknown }).code
      ) === 11000
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

    /*
     * =========================================================
     * GENERIC SERVER ERROR
     * =========================================================
     */

    return NextResponse.json(
      {
        success: false,
        errorCode:
          "REGISTRATION_ERROR",
        message:
          "Unable to complete rider registration. Please try again.",
      },
      { status: 500 }
    );
  }
 }
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const phone = normalizePhone(
      searchParams.get("phone")
    );

    /*
     * -----------------------------------------------------
     * INDIVIDUAL RIDER LOOKUP BY PHONE
     * -----------------------------------------------------
     */

    if (phone) {
      const rider =
  await Rider.findOne({
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

      const isAdmin =
        await isAdminAuthenticated().catch(
          () => false
        );

      /*
       * Admin can inspect the record.
       *
       * Normal rider must prove ownership using
       * the Firebase ID token.
       */
      if (!isAdmin) {
        const firebaseUser =
          await getVerifiedFirebaseUser(req);

        if (
          !firebaseUserOwnsRider(
            firebaseUser,
            rider
          )
        ) {
          return unauthorizedResponse();
        }
      }

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

    /*
     * -----------------------------------------------------
     * ADMIN RIDER DIRECTORY
     * -----------------------------------------------------
     */

    const isAdmin =
      await isAdminAuthenticated().catch(
        () => false
      );

    if (!isAdmin) {
      return unauthorizedResponse();
    }

    const riders =
      await Rider.find({
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
        .sort({
          createdAt: -1,
        })
        .lean();

    /*
     * Fetch wallets separately because wallet balance is
     * NOT a property of the Rider model.
     *
     * This prevents the dashboard from displaying
     * undefined walletBalance.
     */
    const riderIds = riders.map(
      (rider) => rider.riderId
    );

    const wallets =
      riderIds.length > 0
        ? await Wallet.find({
            riderId: {
              $in: riderIds,
            },
            isDeleted: false,
          })
            .select(
              "riderId balance status"
            )
            .lean()
        : [];

    const walletMap = new Map(
      wallets.map((wallet) => [
        wallet.riderId,
        {
          balance: Number(
            wallet.balance || 0
          ),
          status: wallet.status,
        },
      ])
    );

    const data = riders.map(
      (rider) => {
        const wallet =
          walletMap.get(rider.riderId);

        return {
          ...rider,

          /*
           * Dashboard contract.
           */
          walletBalance:
            wallet?.balance ?? 0,

          walletStatus:
            wallet?.status ?? "Blocked",
        };
      }
    );

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
        message:
          "Unable to fetch rider records.",
      },
      { status: 500 }
    );
  }
}