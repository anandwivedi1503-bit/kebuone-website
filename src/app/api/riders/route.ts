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

    const fullName = clean(body.fullName);
    const phone = normalizePhone(body.phone);
    const email = clean(body.email).toLowerCase();

    const aadhaarNumber = clean(body.aadhaarNumber);

    const drivingLicense = normalizeLicense(
      body.drivingLicense
    );

    /*
     * IMPORTANT:
     * We intentionally do NOT trust firebaseUid from the client.
     * The Firebase UID comes from the verified ID token.
     */
    const firebaseIdToken = clean(body.firebaseIdToken);

    const aadhaarFrontUrl = clean(body.aadhaarFrontUrl);
    const aadhaarBackUrl = clean(body.aadhaarBackUrl);
    const licenseFrontUrl = clean(body.licenseFrontUrl);
    const licenseBackUrl = clean(body.licenseBackUrl);
    const profilePhotoUrl = clean(body.profilePhotoUrl);

    const errors: string[] = [];

    /* ---------- Basic validation ---------- */

    if (!firebaseIdToken) {
      errors.push("Phone OTP verification is required.");
    }

    if (!nameRegex.test(fullName)) {
      errors.push("Enter a valid full name.");
    }

    if (!phoneRegex.test(phone)) {
      errors.push("Enter a valid Indian mobile number.");
    }

    if (!emailRegex.test(email)) {
      errors.push("Enter a valid email address.");
    }

    if (!aadhaarRegex.test(aadhaarNumber)) {
      errors.push(
        "Aadhaar number must be exactly 12 digits."
      );
    }

    /*
     * Driving licence remains optional because your existing
     * frontend currently allows registration without it.
     */
    if (
      drivingLicense &&
      !drivingLicenseRegex.test(drivingLicense)
    ) {
      errors.push(
        "Enter a valid driving license number."
      );
    }

    /* ---------- Required documents ---------- */

    if (!aadhaarFrontUrl) {
      errors.push("Aadhaar Front is required.");
    }

    if (!aadhaarBackUrl) {
      errors.push("Aadhaar Back is required.");
    }

    if (!profilePhotoUrl) {
      errors.push("Profile photo is required.");
    }

    /*
     * Documents must originate from our Cloudinary upload flow.
     */
    const documentUrls: Array<[string, string, boolean]> = [
      ["Aadhaar Front", aadhaarFrontUrl, true],
      ["Aadhaar Back", aadhaarBackUrl, true],
      ["Driving License Front", licenseFrontUrl, false],
      ["Driving License Back", licenseBackUrl, false],
      ["Profile Photo", profilePhotoUrl, true],
    ];

    for (const [label, url, required] of documentUrls) {
      if (!url && !required) continue;

      if (url && !isSafeCloudinaryUrl(url)) {
        errors.push(
          `${label} must be uploaded through the approved document upload service.`
        );
      }
    }

    /* ---------- Prevent duplicate files ---------- */

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
        "Driving License Front and Back cannot be the same file."
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

    /* ---------- Reference phone validation ---------- */

    const reference1Phone = normalizePhone(
      body.reference1Phone
    );

    const reference2Phone = normalizePhone(
      body.reference2Phone
    );

    if (
      body.reference1Phone &&
      !phoneRegex.test(reference1Phone)
    ) {
      errors.push(
        "Reference 1 phone number is invalid."
      );
    }

    if (
      body.reference2Phone &&
      !phoneRegex.test(reference2Phone)
    ) {
      errors.push(
        "Reference 2 phone number is invalid."
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VERIFY FIREBASE TOKEN
    ===================================================== */

    let decodedToken;

    try {
      decodedToken =
        await adminAuth.verifyIdToken(firebaseIdToken);
    } catch {
      return NextResponse.json(
        {
          success: false,
          errors: ["Invalid or expired Firebase token."],
        },
        { status: 401 }
      );
    }

    if (!decodedToken.uid) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Invalid Firebase account."],
        },
        { status: 401 }
      );
    }

    const verifiedPhone =
      normalizePhone(decodedToken.phone_number);

    if (
      !verifiedPhone ||
      verifiedPhone !== phone
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Verified phone number does not match registration phone.",
          ],
        },
        { status: 400 }
      );
    }

    /* =====================================================
       DUPLICATE CHECK + RIDER + WALLET
       ALL IN ONE TRANSACTION
    ===================================================== */

    session = await mongoose.startSession();

    session.startTransaction();

    try {
      const duplicateChecks: Record<string, string>[] = [
        { phone },
        { email },
        { aadhaarNumber },
        { firebaseUid: decodedToken.uid },
      ];

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

        if (
          existingRider.approvalStatus === "Approved" &&
          existingRider.bookingEnabled
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus: "Approved",
              riderId: existingRider.riderId,
              message:
                "Your account is already approved. Please continue to Book Bike.",
            },
            { status: 409 }
          );
        }

        if (
          existingRider.approvalStatus ===
          "Under Review"
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus: "Under Review",
              riderId: existingRider.riderId,
              message:
                "Your KYC verification is under review.",
            },
            { status: 409 }
          );
        }

        if (
          existingRider.approvalStatus ===
          "Rejected"
        ) {
          return NextResponse.json(
            {
              success: false,
              riderExists: true,
              riderStatus: "Rejected",
              riderId: existingRider.riderId,
              message:
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
            message:
              "A rider with this information already exists.",
          },
          { status: 409 }
        );
      }

      /* ---------- Generate Rider ID ---------- */

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
        `RDR-${String(counter.seq).padStart(6, "0")}`;

      /* ---------- Create Rider ---------- */

      const riderDocs = await Rider.create(
        [
          {
            riderId,

            fullName,
            phone,
            email,

            aadhaarNumber,

            drivingLicense:
              drivingLicense || undefined,

            aadhaarFrontUrl,
            aadhaarBackUrl,

            licenseFrontUrl:
              licenseFrontUrl || "",

            licenseBackUrl:
              licenseBackUrl || "",

            profilePhotoUrl,

            emergencyContactName:
              clean(body.emergencyContactName),

            emergencyContactPhone:
              normalizePhone(
                body.emergencyContactPhone
              ),

            reference1Name:
              clean(body.reference1Name),

            reference1Phone,

            reference2Name:
              clean(body.reference2Name),

            reference2Phone,

            instagramId:
              clean(body.instagramId),

            facebookId:
              clean(body.facebookId),

            /*
             * SERVER-AUTHORITATIVE FIREBASE ID
             */
            firebaseUid:
              decodedToken.uid,

            verifiedPhoneNumber:
              decodedToken.phone_number || `+91${phone}`,

            phoneVerified: true,

            approvalStatus: "Under Review",

            kycStatus: "Pending",

            status: "Blocked",

            bookingEnabled: false,

            activeRide: false,

            securityDeposit: 0,

            blacklisted: false,

            notificationsEnabled: true,

            lastOtpVerifiedAt: new Date(),
          },
        ],
        {
          session,
        }
      );

      const rider = riderDocs[0];

      /* ---------- Create Wallet ---------- */

      const existingWallet =
        await Wallet.findOne({
          riderId: rider.riderId,
        }).session(session);

      if (existingWallet) {
        throw new Error(
          "Wallet already exists for newly created rider."
        );
      }

      await Wallet.create(
        [
          {
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

            isDeleted: false,
          },
        ],
        {
          session,
        }
      );

      await session.commitTransaction();

      /*
       * IMPORTANT:
       * Do NOT return the complete Rider document.
       * It contains sensitive information such as Aadhaar
       * and Firebase UID.
       */
      return NextResponse.json(
        {
          success: true,

          message:
            "Rider Registered Successfully",

          data: safeRiderResponse({
            riderId: rider.riderId,
            fullName: rider.fullName,
            phone: rider.phone,
            approvalStatus:
              rider.approvalStatus,
            kycStatus: rider.kycStatus,
            status: rider.status,
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
     * Duplicate-key race condition protection.
     * MongoDB remains the final authority for unique indexes.
     */
    if (
      error instanceof Error &&
      error.message.includes("E11000")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A rider with the same phone, email, Aadhaar, driving license or Firebase account already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete rider registration. Please try again.",
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