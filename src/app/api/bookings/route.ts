import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import {
  firebaseUserOwnsRider,
  firebasePhoneMatches,
  getVerifiedFirebaseUser,
  normalizeIndianPhone,
} from "@/lib/requestAuth";
import { ensureRiderWallet } from "@/lib/ensureRiderWallet";
import { gstBreakdown, money } from "@/lib/gst";
import {
  catalogRate,
  rtoDailyRate,
  rtoInstallment,
  rtoTenureMonths,
} from "@/lib/rentalPlans";
import { publicApiError } from "@/lib/publicError";


const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const idRegex = /^[A-Za-z0-9_-]{3,60}$/;
const rtoRelations = [
  "Spouse",
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Other",
];

const rentalModes = [
  "Hourly",
  "Daily",
  "Weekly",
  "Monthly",
  "Rent To Own",
];
 function clean(value: unknown) {
  return String(value || "").trim();
}

const NOT_DELETED_FILTER = {
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } },
  ],
};

async function findActiveRider(
  filters: Record<string, unknown>[],
  session: mongoose.ClientSession
) {
  for (const filter of filters) {
    const rider = await Rider.findOne(
      {
        ...filter,
        ...NOT_DELETED_FILTER,
      },
      null,
      { session }
    );

    if (rider) {
      return rider;
    }
  }

  return null;
}



export async function GET() {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const bookings = await Booking.find({
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } },
  ],
}).sort({
  createdAt: -1,
});

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch bookings",
        error: publicApiError(error, "Failed to fetch bookings"),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;
   let booking: any = null;
   let lockedVehicleId = "";

   try {
    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    const body = await req.json();
    const bookingId = clean(body.bookingId);
    const submittedName = clean(body.userName);
    let userName = submittedName;
    const userPhone = normalizeIndianPhone(body.userPhone);
    const bodyRiderId = clean(body.riderId);
    const vehicleId = clean(body.vehicleId);
    const startHub = clean(body.startHub);
    const pickupHubName = clean(body.pickupHubName);
const hubAliases = Array.from(
  new Set(
    [startHub, pickupHubName, ...(Array.isArray(body.hubAliases) ? body.hubAliases : [])]
      .map(clean)
      .filter(Boolean)
  )
);
    const rentalMode = clean(body.rentalMode);
    const referenceBy = clean(body.referenceBy).slice(0, 80);
    const isAdminRequest = await isAdminAuthenticated().catch(
      () => false
    );
    const firebaseUser = isAdminRequest
      ? null
      : await getVerifiedFirebaseUser(req, body.firebaseIdToken);

    const errors: string[] = [];
    const existingBooking = await Booking.findOne(
  { bookingId },
  null,
  { session }
);

if (existingBooking) {

  await session.abortTransaction();
  await session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: ["Booking ID already exists."],
    },
    { status: 409 }
  );
}

    if (!idRegex.test(bookingId)) errors.push("Valid booking ID is required.");
    if (
      !isAdminRequest &&
      !firebasePhoneMatches(firebaseUser, userPhone)
    ) {
      await session.abortTransaction();
      await session.endSession();

      return unauthorizedResponse();
    }

    const riderLookupFilters: Record<string, unknown>[] = [];

    if (firebaseUser?.uid) {
      riderLookupFilters.push({ firebaseUid: firebaseUser.uid });
    }

    if (bodyRiderId) {
      riderLookupFilters.push({ riderId: bodyRiderId });
    }

    if (userPhone) {
      riderLookupFilters.push({ phone: userPhone });
    }

    const rider = await findActiveRider(
      riderLookupFilters,
      session
    );

if (!rider) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Rider is not registered. Please complete registration first."],
    },
    { status: 404 }
  );
}

if (!isAdminRequest && !firebaseUserOwnsRider(firebaseUser, rider)) {
  await session.abortTransaction();
  await session.endSession();

  return unauthorizedResponse();
}

if (!rider.phoneVerified) {

  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Phone number is not verified."],
    },
    { status: 403 }
  );
}

if (rider.approvalStatus !== "Approved") {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Your account is still under review. Please wait for admin approval."],
    },
    { status: 403 }
  );
}

if (rider.kycStatus !== "Approved") {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Your KYC has not been approved yet."],
    },
    { status: 403 }
  );
}

if (rider.blacklisted) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Your account has been blocked. Please contact support."],
    },
    { status: 403 }
  );
}

userName = clean(rider.fullName);

if (rider.activeRide) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["You already have an active ride."],
    },
    { status: 409 }
  );
}

if (!rider.bookingEnabled) {
  await session.abortTransaction();
  await session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Booking is not enabled for your account.",
      ],
    },
    { status: 403 }
  );
}

if (rider.status !== "Active") {
  await session.abortTransaction();
  await session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Your account is not active.",
      ],
    },
    { status: 403 }
  );
}

try {
  await ensureRiderWallet(
    {
      riderId: rider.riderId,
      _id: rider._id,
      fullName: rider.fullName,
      phone: rider.phone,
      bookingEnabled: rider.bookingEnabled,
      status: rider.status,
    },
    "Booking System"
  );
} catch (walletError) {
  await session.abortTransaction();
  await session.endSession();
  session = null;

  console.error("BOOKING WALLET SYNC ERROR:", walletError);

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Your wallet could not be prepared for booking. Please contact support.",
      ],
    },
    { status: 500 }
  );
}

    if (!nameRegex.test(userName)) errors.push("Valid rider name is required.");
    if (!phoneRegex.test(userPhone)) errors.push("Valid Indian mobile number is required.");
    if (!idRegex.test(vehicleId)) errors.push("Valid vehicle ID is required.");
    const hasValidHub = hubAliases.some(
  (alias) => alias.trim().length >= 1
);

if (!hasValidHub) {
  errors.push("Pickup hub is required.");
}
    if (!rentalModes.includes(rentalMode)) errors.push("Valid rental mode is required.");

    const rtoNomineeName = clean(body.rtoNomineeName).slice(0, 80);
    const rtoNomineeRelation = clean(body.rtoNomineeRelation).slice(0, 40);
    const rtoPermanentAddress = clean(body.rtoPermanentAddress).slice(0, 240);
    const rtoOccupation = clean(body.rtoOccupation).slice(0, 80);
    const rtoGuardianName = clean(body.rtoGuardianName).slice(0, 80);
    const rtoEmergencyPhone = clean(body.rtoEmergencyPhone).replace(/\D/g, "").slice(0, 10);
    const rtoEmail = clean(body.rtoEmail).toLowerCase().slice(0, 120);
    const rtoAgreementAccepted = Boolean(body.rtoAgreementAccepted);

    if (rentalMode === "Rent To Own") {
      if (!nameRegex.test(rtoNomineeName)) {
        errors.push("Nominee name is required for Rent to Own.");
      }
      if (!rtoRelations.includes(rtoNomineeRelation)) {
        errors.push("Nominee relation is required for Rent to Own.");
      }
      if (!nameRegex.test(rtoGuardianName)) {
        errors.push("Father / guardian name is required for Rent to Own.");
      }
      if (!phoneRegex.test(rtoEmergencyPhone)) {
        errors.push("Valid emergency contact number is required for Rent to Own.");
      }
      if (!emailRegex.test(rtoEmail)) {
        errors.push("Valid email is required for Rent to Own.");
      }
      if (rtoPermanentAddress.length < 12) {
        errors.push("Permanent address is required for Rent to Own.");
      }
      if (rtoOccupation.length < 2) {
        errors.push("Occupation is required for Rent to Own.");
      }
      if (!rtoAgreementAccepted) {
        errors.push("You must accept the Rent to Own ownership agreement.");
      }
    }

    if (errors.length > 0) {
      await session.abortTransaction();
await session.endSession();
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    

const existingRide = await Booking.findOne({
  riderId: rider.riderId,
  rideStatus: {
    $in: [
      "Booked",
      "Reserved",
      "Payment Pending",
      "Ready For Pickup",
      "In Ride",
    ],
  },
},
null,
{ session }
);

if (existingRide) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: [
        "You already have an active booking.",
      ],
    },
    { status: 409 }
  );
}

const existingPendingBooking = await Booking.findOne(
{
    riderId: rider.riderId,
    paymentStatus: {
        $in: ["Pending", "Partial"],
    },
    rideStatus: {
        $nin: ["Cancelled", "Completed"],
    },
},
null,
{ session }
);

if (existingPendingBooking) {

    await session.abortTransaction();
    await session.endSession();

    return NextResponse.json(
    {
        success:false,
        errors:[
            "Previous booking payment is still pending."
        ]
    },
    {status:409}
    );
}

/*
|--------------------------------------------------------------------------
| Duplicate Booking Request Protection
|--------------------------------------------------------------------------
*/

if (body.bookingRequestId) {

    const duplicateRequest = await Booking.findOne(
        {
            bookingRequestId: body.bookingRequestId,
        },
        null,
        { session }
    );

    if (duplicateRequest) {

        await session.abortTransaction();
        await session.endSession();

        return NextResponse.json(
            {
                success: true,
                duplicate: true,
                bookingId: duplicateRequest.bookingId,
                message: "Booking request already processed.",
            },
            {
                status: 200,
            }
        );
    }

}

const vehicle = await Vehicle.findOneAndUpdate(
  {
    vehicleId,
    vehicleStatus: "Available",
    isActive: true,
    currentBookingId: "",
    assignedRider: "",
    batteryPercentage: { $gte: 20 },
  },
  {
    $set: {
      vehicleStatus: "Booked",
      assignedRider: rider.riderId,
      currentBookingId: bookingId,
      currentRiderId: rider.riderId,
      lockStatus: "Locked",
    },
  },
  {
    new: true,
    session,
  }
);

if (!vehicle) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Selected bike is not available."],
    },
    { status: 404 }
  );
}
 
const vehicleHub = clean(vehicle.currentHub).toLowerCase();

const hubsMatch = (alias: string) => {
  const key = clean(alias).toLowerCase();
  if (!key || !vehicleHub) return false;
  if (key === vehicleHub) return true;
  if (/^\d+$/.test(key) && /^\d+$/.test(vehicleHub)) {
    return Number(key) === Number(vehicleHub);
  }
  return key.includes(vehicleHub) || vehicleHub.includes(key);
};

const matched = hubAliases.some(hubsMatch);

if (!matched) {
  await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["Selected bike does not belong to this hub."],
    },
    { status: 400 }
  );
}

  

     if (!vehicle.isActive) {
      await session.abortTransaction();
await session.endSession();
  return NextResponse.json(
    {
      success: false,
      errors: ["This vehicle has been deactivated by the administrator."],
    },
    { status: 403 }
  );
}

    lockedVehicleId = String(vehicle._id);

    const rentalStartDate = new Date();

const rentalAmount =
  rentalMode === "Hourly"
    ? catalogRate("Hourly", vehicle.hourlyRate)
    : rentalMode === "Daily"
    ? catalogRate("Daily", vehicle.dailyRate)
    : rentalMode === "Weekly"
    ? catalogRate("Weekly", vehicle.weeklyRate)
    : rentalMode === "Monthly"
    ? catalogRate("Monthly", vehicle.monthlyRate)
    : rentalMode === "Rent To Own"
    ? rtoInstallment(vehicle.rentToOwnDailyRate)
    : 0;

const rentalEndDate = new Date(rentalStartDate);

switch (rentalMode) {
  case "Hourly":
    rentalEndDate.setHours(
      rentalEndDate.getHours() + 1
    );
    break;

  case "Daily":
    rentalEndDate.setDate(
      rentalEndDate.getDate() + 1
    );
    break;

  case "Weekly":
    rentalEndDate.setDate(
      rentalEndDate.getDate() + 7
    );
    break;

  case "Monthly":
    rentalEndDate.setMonth(
      rentalEndDate.getMonth() + 1
    );
    break;

  case "Rent To Own": {
    const months = rtoTenureMonths(vehicle.rentToOwnMonths);

    rentalEndDate.setMonth(
      rentalEndDate.getMonth() + months
    );

    break;
  }

  default:
    await session.abortTransaction();
    await session.endSession();

    return NextResponse.json(
      {
        success: false,
        errors: ["Invalid rental mode."],
      },
      { status: 400 }
    );
}

const securityDeposit = money(vehicle.securityDeposit || 2500);
const tax = gstBreakdown(rentalAmount);
const payableAmount = money(tax.totalWithGst + securityDeposit);

if (
  rentalAmount <= 0 ||
  payableAmount <= 0 ||
  rentalEndDate <= rentalStartDate
) {
  await session.abortTransaction();
  await session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Selected rental plan does not have a valid server configuration.",
      ],
    },
    { status: 400 }
  );
}

    if (rentalAmount <= 0 || payableAmount <= 0) {
      await Vehicle.findByIdAndUpdate(
  lockedVehicleId,
  {
    vehicleStatus: "Available",
    assignedRider: "",
    currentBookingId: "",
    currentRiderId: "",
    lockStatus: "Unlocked",
  },
  {
    session,
  }
);

await session.abortTransaction();
await session.endSession();

return NextResponse.json(
  {
    success: false,
    errors: [
      "Selected rental plan does not have a valid server price.",
    ],
  },
  {
    status: 400,
  }
);
    }

    const bookingArray = await Booking.create(
  [
    {
      bookingId,
      bookingRequestId:
body.bookingRequestId ||
new mongoose.Types.ObjectId().toString(),
      riderId: rider.riderId,
      userId: rider._id,
      userEmail: rider.email,

      bookingDate: new Date(),
      bookingTime: new Date(),

      userName,
      userPhone,

      vehicleId: vehicle.vehicleId,
      vehicleNumber: vehicle.registrationNumber,
      chassisNumber: vehicle.chassisNumber,

      vehicleType:
        vehicle.vehicleType ||
        "Electric Scooter",

      vehicleModel:
        vehicle.vehicleModel,

      batteryPercentage:
        vehicle.batteryPercentage,

      currentHub:
        vehicle.currentHub,

      batteryType:
        vehicle.batteryType ||
        "Chargeable",

      registrationType:
        vehicle.registrationType ||
        "RTO",

      rentalMode,

dailyRate:
  catalogRate("Daily", vehicle.dailyRate),

weeklyRate:
  catalogRate("Weekly", vehicle.weeklyRate),

monthlyRate:
  catalogRate("Monthly", vehicle.monthlyRate),

hourlyRate:
  catalogRate("Hourly", vehicle.hourlyRate),

rentToOwnDailyRate:
  rtoDailyRate(vehicle.rentToOwnDailyRate),

rentToOwnMonths:
  rtoTenureMonths(vehicle.rentToOwnMonths),

rentToOwnCompletedDays: rentalMode === "Rent To Own" ? 0 : 0,

remainingRentToOwnDays:
  rentalMode === "Rent To Own"
    ? rtoTenureMonths(vehicle.rentToOwnMonths) * 30
    : 0,

ownershipTransferred: false,

rtoNomineeName: rentalMode === "Rent To Own" ? rtoNomineeName : "",
rtoNomineeRelation: rentalMode === "Rent To Own" ? rtoNomineeRelation : "",
rtoGuardianName: rentalMode === "Rent To Own" ? rtoGuardianName : "",
rtoEmergencyPhone: rentalMode === "Rent To Own" ? rtoEmergencyPhone : "",
rtoEmail: rentalMode === "Rent To Own" ? rtoEmail : "",
rtoPermanentAddress:
  rentalMode === "Rent To Own" ? rtoPermanentAddress : "",
rtoOccupation: rentalMode === "Rent To Own" ? rtoOccupation : "",
rtoAgreementAccepted:
  rentalMode === "Rent To Own" ? rtoAgreementAccepted : false,
rtoAgreementAcceptedAt:
  rentalMode === "Rent To Own" ? new Date() : undefined,
rtoCertificateNumber:
  rentalMode === "Rent To Own"
    ? `RTO-${bookingId.replace(/[^A-Z0-9]/gi, "").slice(-10)}`
    : "",
rtoInstallmentsPaid: 0,

rentalStartDate,

rentalEndDate,

rateApplied: rentalAmount,

startHub:
  pickupHubName ||
  startHub ||
  vehicle.currentHub,

      pickupCity:
        clean(body.city),

      securityDeposit,

      gstAmount: tax.gstAmount,
      cgstAmount: tax.cgstAmount,
      sgstAmount: tax.sgstAmount,
      cgstRate: tax.cgstRate,
      sgstRate: tax.sgstRate,

      paymentDue:
        payableAmount,

      advancePaid: 0,

      totalAmount:
        rentalAmount,

      receivedAmount: 0,

      pendingAmount:
        payableAmount,

      paymentMode: "Razorpay",

      paymentStatus: "Pending",

      rideStatus: "Booked",

      referenceBy,
    },
  ],
  {
    session,
  }
);

 booking = bookingArray[0];



  await Rider.findByIdAndUpdate(
  rider._id,
   {
    currentBookingId: booking.bookingId,
  },
  {
    session,
  }
);
await Vehicle.findByIdAndUpdate(
  vehicle._id,
  {
    currentBookingId: booking.bookingId,
  },
  {
    session,
  }
);
booking = booking.toObject();

await session.commitTransaction();
await session.endSession();
    return NextResponse.json({
  success: true,
  message: "Booking created successfully.",
  bookingId: booking.bookingId,
  pendingAmount: booking.pendingAmount,
  data: booking,
});
      } catch (error) {
  if (session) {
    try {
      await session.abortTransaction();
    } catch (rollbackError) {
      console.error(
        "Transaction rollback failed:",
        rollbackError
      );
    }

    await session.endSession();
    session = null;
  }

  if (lockedVehicleId) {
    try {
      await Vehicle.findByIdAndUpdate(lockedVehicleId, {
        vehicleStatus: "Available",
        assignedRider: "",
        currentBookingId: "",
        currentRiderId: "",
        lockStatus: "Unlocked",
      });
    } catch (unlockError) {
      console.error("VEHICLE UNLOCK ERROR:", unlockError);
    }
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(
    "BOOKING API ERROR:",
    error
  );

  const isReplicaSetError =
    errorMessage.includes("replica set") ||
    errorMessage.includes("Transaction numbers");

  return NextResponse.json(
    {
      success: false,
      message: isReplicaSetError
        ? "Database is not configured for booking transactions. Use MongoDB Atlas or a replica set."
        : "Failed to create booking.",
      details: errorMessage,
    },
    {
      status: 500,
    }
  );
}
}
