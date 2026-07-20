import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";


const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const idRegex = /^[A-Za-z0-9_-]{3,60}$/;

const rentalModes = ["Daily", "Weekly", "Monthly"];
 function clean(value: unknown) {
  return String(value || "").trim();
}



export async function GET() {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const bookings = await Booking.find().sort({
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
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {

  const session = await mongoose.startSession();

  let booking: any = null;

  let lockedVehicleId = "";

  try {

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    session.startTransaction();

    const body = await req.json();
    const bookingId = clean(body.bookingId);
    const userName = clean(body.userName);
    const userPhone = clean(body.userPhone).replace(/\D/g, "");
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
    const rider = await Rider.findOne(
  { phone: userPhone },
  null,
  { session }
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

/*
|--------------------------------------------------------------------------
| Validate Rider Identity
|--------------------------------------------------------------------------
*/

if (rider.fullName !== userName) {
  await session.abortTransaction();
  await session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Rider details do not match the registered account.",
      ],
    },
    { status: 403 }
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
    if (!nameRegex.test(userName)) errors.push("Valid rider name is required.");
    if (!phoneRegex.test(userPhone)) errors.push("Valid Indian mobile number is required.");
    if (!idRegex.test(vehicleId)) errors.push("Valid vehicle ID is required.");
    if (hubAliases.length === 0 || hubAliases[0].length < 3) {
  errors.push("Pickup hub is required.");
}
    if (!rentalModes.includes(rentalMode)) errors.push("Valid rental mode is required.");

    if (errors.length > 0) {
      await session.abortTransaction();
await session.endSession();
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const vehicle = await Vehicle.findOne({
  vehicleId,
  vehicleStatus: "Available",
  isActive: true,
},
null,
{ session }
);

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

const matched = hubAliases.some(
  (hub) => clean(hub).toLowerCase() === vehicleHub
);

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

vehicle.vehicleStatus = "Booked";
vehicle.assignedRider = rider.riderId;
vehicle.lockStatus = "Locked";

await vehicle.save({ session });

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

    const rentalAmount =
      rentalMode === "Daily"
        ? Number(vehicle.dailyRate || 0)
        : rentalMode === "Weekly"
        ? Number(vehicle.weeklyRate || 0)
        : Number(vehicle.monthlyRate || 0);

    const securityDeposit = Number(vehicle.securityDeposit || 2500);
    const payableAmount = rentalAmount + securityDeposit;

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
        Number(vehicle.dailyRate || 0),

      weeklyRate:
        Number(vehicle.weeklyRate || 0),

      monthlyRate:
        Number(vehicle.monthlyRate || 0),

      rentalStartDate: new Date(),

      startHub:
        pickupHubName ||
        startHub ||
        vehicle.currentHub,

      pickupCity:
        clean(body.city),

      securityDeposit,

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

    const wallet = await Wallet.findOne(
  {
    riderId: rider.riderId,
  },
  null,
  { session }
);

if (!wallet) {
  throw new Error("Wallet not found.");
}

wallet.securityDepositHold += securityDeposit;

await wallet.save({
  session,
});

await WalletTransaction.create(
[
{
  transactionId:
    "WTX-" +
    Date.now() +
    "-" +
    Math.floor(Math.random() * 1000),

  riderId: rider.riderId,

  userId: rider._id,

  userName: rider.fullName,

  amount: securityDeposit,

  transactionType: "Security Deposit Hold",

  paymentMethod: "Wallet",

  bookingId: booking.bookingId,

  balanceAfter: wallet.balance,

  remarks: `Security deposit held for Booking ${booking.bookingId}`,

  status: "Success",
},
],
{
session,
}
);

    await Rider.findByIdAndUpdate(
  rider._id,
  {
    activeRide: true,
    currentBookingId: booking.bookingId,
  },
  {
    session,
  }
);
await Vehicle.findByIdAndUpdate(vehicle._id, {
  currentBookingId: booking.bookingId,
  currentRiderId: rider.riderId,
  vehicleStatus: "Booked",
  assignedRider: rider.riderId,
  lockStatus: "Locked",
},
{
  session,
}
);
await booking.populate("userId");

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
    /*
|--------------------------------------------------------------------------
| Rollback Transaction
|--------------------------------------------------------------------------
*/

try {
  await session.abortTransaction();
} catch (rollbackError) {
  console.error("Transaction rollback failed:", rollbackError);
}

await session.endSession();

console.error("BOOKING API ERROR:", error);

return NextResponse.json(
  {
    success: false,
    message: "Failed to create booking.",
    error:
      process.env.NODE_ENV === "development"
        ? String(error)
        : undefined,
  },
  {
    status: 500,
  }
);
  }
}