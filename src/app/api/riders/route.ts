import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";
import { adminAuth } from "@/lib/firebaseAdmin";
import Wallet from "@/models/Wallet";

export const runtime = "nodejs";

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const aadhaarRegex = /^\d{12}$/;
const drivingLicenseRegex = /^[A-Z]{2}\d{2}\d{11}$/;

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const fullName = clean(body.fullName);
    const phone = clean(body.phone).replace(/\D/g, "");
    const email = clean(body.email).toLowerCase();
    const aadhaarNumber = clean(body.aadhaarNumber);
    const drivingLicense = clean(body.drivingLicense)
      .toUpperCase()
      .replace(/\s/g, "");
    const firebaseIdToken = clean(body.firebaseIdToken);

    const errors: string[] = [];

    if (!firebaseIdToken) errors.push("Phone OTP verification is required.");
    if (!nameRegex.test(fullName)) errors.push("Enter a valid full name.");
    if (!phoneRegex.test(phone)) errors.push("Enter a valid Indian mobile number.");
    if (!emailRegex.test(email)) errors.push("Enter a valid email address.");
    if (!aadhaarRegex.test(aadhaarNumber)) errors.push("Aadhaar number must be exactly 12 digits.");
    if (drivingLicense && !drivingLicenseRegex.test(drivingLicense)) errors.push("Enter a valid driving license number.");
    if (!body.aadhaarFrontUrl)
    errors.push("Aadhaar Front is required.");

if (!body.aadhaarBackUrl)
    errors.push("Aadhaar Back is required.");
    if (!body.profilePhotoUrl) errors.push("Profile photo is required.");

    // Prevent duplicate document uploads

if (
  body.aadhaarFrontUrl &&
  body.aadhaarBackUrl &&
  body.aadhaarFrontUrl === body.aadhaarBackUrl
) {
  errors.push(
    "Aadhaar Front and Aadhaar Back cannot be the same file."
  );
}

if (
  body.licenseFrontUrl &&
  body.licenseBackUrl &&
  body.licenseFrontUrl === body.licenseBackUrl
) {
  errors.push(
    "Driving License Front and Back cannot be the same file."
  );
}

if (
  body.aadhaarFrontUrl &&
  body.licenseFrontUrl &&
  body.aadhaarFrontUrl === body.licenseFrontUrl
) {
  errors.push(
    "Aadhaar and Driving License cannot use the same document."
  );
}

if (
  body.profilePhotoUrl &&
  (
    body.profilePhotoUrl === body.aadhaarFrontUrl ||
    body.profilePhotoUrl === body.aadhaarBackUrl ||
    body.profilePhotoUrl === body.licenseFrontUrl ||
    body.profilePhotoUrl === body.licenseBackUrl
  )
) {
  errors.push(
    "Profile photo must be different from uploaded documents."
  );
}

    if (body.reference1Phone && !phoneRegex.test(clean(body.reference1Phone))) {
      errors.push("Reference 1 phone number is invalid.");
    }

    if (body.reference2Phone && !phoneRegex.test(clean(body.reference2Phone))) {
      errors.push("Reference 2 phone number is invalid.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);

    if (decodedToken.phone_number !== `+91${phone}`) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Verified phone number does not match registration phone."],
        },
        { status: 400 }
      );
    }

    const existingRider = await Rider.findOne({
  $or: [
    { phone },
    { email },
    { aadhaarNumber },
    { drivingLicense },
    { firebaseUid: decodedToken.uid },
  ],
});

if (existingRider) {

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
    existingRider.approvalStatus === "Under Review"
  ) {

    return NextResponse.json(
      {
        success: false,
        riderExists: true,
        riderStatus: "Under Review",
        message:
          "Your KYC verification is under review.",
      },
      { status: 409 }
    );

  }

  if (
    existingRider.approvalStatus === "Rejected"
  ) {

    return NextResponse.json(
      {
        success: false,
        riderExists: true,
        riderStatus: "Rejected",
        message:
          "Your previous registration was rejected. Please contact support.",
      },
      { status: 409 }
    );

  }

  return NextResponse.json(
    {
      success: false,
      message:
        "A rider with this information already exists.",
    },
    { status: 409 }
  );

}

const lastRider = await Rider.findOne().sort({ createdAt: -1 });

let nextNumber = 1;

if (lastRider?.riderId) {
  const match = lastRider.riderId.match(/RDR-(\d+)/);

  if (match) {
    nextNumber = Number(match[1]) + 1;
  }
}

const riderId = `RDR-${String(nextNumber).padStart(6, "0")}`;

    const rider = await Rider.create({
  ...body,

  riderId,

  fullName,
  phone,
  email,

  aadhaarNumber,
  drivingLicense,

  phoneVerified: true,
  firebaseUid: decodedToken.uid,
  verifiedPhoneNumber: decodedToken.phone_number,

  approvalStatus: "Under Review",
  kycStatus: "Pending",

  activeRide: false,

  walletBalance: 0,
  securityDeposit: 0,

  status: "Blocked",
bookingEnabled: false,
  blacklisted: false,

  notificationsEnabled: true,

  lastOtpVerifiedAt: new Date(),

  firebaseIdToken: undefined,
});

const existingWallet = await Wallet.findOne({
  riderId: rider.riderId,
});

if (!existingWallet) {
  await Wallet.create({
    riderId: rider.riderId,

    userId: rider._id,

    userName: rider.fullName,

    phone: rider.phone,

    balance: 0,

    securityDepositHold: 0,

    totalRecharge: 0,

    totalSpent: 0,

    totalRefund: 0,

    status: "Active",
  });
 }
 

     return NextResponse.json({
      success: true,
      message: "Rider Registered Successfully",
      data: rider,
    });
  } catch (error) {
    console.error("RIDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: ["Rider registration failed. Please verify OTP again."],
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const phone = clean(searchParams.get("phone"));

    if (phone) {

  const rider = await Rider.findOne({ phone }).select(`
riderId
fullName
phone
email
approvalStatus
kycStatus
phoneVerified
bookingEnabled
blacklisted
status
walletBalance
`)


  if (!rider) {
    return NextResponse.json(
      {
        success: false,
        message: "Rider not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: rider,
  });

}

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    const riders = await Rider.find()
.select(
"riderId fullName phone email kycStatus approvalStatus status bookingEnabled walletBalance aadhaarFrontUrl aadhaarBackUrl licenseFrontUrl licenseBackUrl profilePhotoUrl createdAt"
)
.sort({
createdAt:-1
});

    return NextResponse.json({
      success: true,
      data: riders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}