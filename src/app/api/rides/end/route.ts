import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";
import Rider from "@/models/Rider";

import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Refund from "@/models/Refund";

export async function POST(req: Request) {
  try {
    await connectDB();
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}

    const { bookingId, endHub, rideEndOTP } = await req.json();
    if (!endHub?.trim()) {
  return NextResponse.json(
    {
      success: false,
      message: "End Hub is required.",
    },
    { status: 400 }
  );
}

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID required.",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (!rideEndOTP) {
  return NextResponse.json(
    {
      success: false,
      message: "Ride End OTP is required.",
    },
    { status: 400 }
  );
}

if (booking.rideEndOTPVerified) {
  return NextResponse.json(
    {
      success: false,
      message: "Ride End OTP already used.",
    },
    { status: 400 }
  );
}

if (booking.rideEndOTP !== rideEndOTP) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid Ride End OTP.",
    },
    { status: 400 }
  );
}



    if (booking.rideStatus !== "In Ride") {
      return NextResponse.json(
        {
          success: false,
          message: "Ride has not started.",
        },
        { status: 400 }
      );
    }

    if (
  booking.actualRideEnd ||
  booking.completedAt
) {
  return NextResponse.json(
    {
      success: false,
      message: "Ride has already been completed.",
    },
    { status: 400 }
  );
}

    booking.actualRideEnd = new Date();
    booking.completedAt = new Date();

    if (booking.actualRideStart) {

  booking.totalRideMinutes = Math.round(
    (
      booking.actualRideEnd.getTime() -
      new Date(booking.actualRideStart).getTime()
    ) / 60000
  );

}

booking.rideStatus = "Completed";

booking.endHub = endHub || booking.startHub;
booking.currentHub = endHub || booking.startHub;

booking.rideEndOTPVerified = true;

booking.rideEndOTPVerifiedAt = new Date();

booking.rideEndOTP = "";

booking.rideEndOTPExpiry = null;

  

    const vehicle = await Vehicle.findOne({
  vehicleId: booking.vehicleId,
});

if (!vehicle) {
  return NextResponse.json(
    {
      success: false,
      message: "Vehicle not found.",
    },
    { status: 404 }
  );
}

if (vehicle.vehicleStatus !== "In Ride") {
  return NextResponse.json(
    {
      success: false,
      message: "Vehicle is not currently in ride.",
    },
    { status: 400 }
  );
}

if (vehicle.currentBookingId !== booking.bookingId) {
  return NextResponse.json(
    {
      success: false,
      message: "Vehicle booking mismatch.",
    },
    { status: 400 }
  );
}

    await Vehicle.findOneAndUpdate(
      {
        vehicleId: booking.vehicleId,
      },
      {
        vehicleStatus:
  vehicle.batteryPercentage < 20
    ? "Low Battery"
    : "Available",
        currentHub: endHub || booking.startHub,
        currentBookingId: "",
        currentRiderId: "",
        assignedRider: "",
        lockStatus: "Locked",
        rideEndedAt: new Date(),
      }
    );
    
    const rider = await Rider.findOne({
  riderId: booking.riderId,
});

if (!rider) {
  return NextResponse.json(
    {
      success: false,
      message: "Rider not found.",
    },
    { status: 404 }
  );
}

if (
  rider.currentBookingId &&
  rider.currentBookingId !== booking.bookingId
) {
  return NextResponse.json(
    {
      success: false,
      message: "Rider booking mismatch.",
    },
    { status: 400 }
  );
}

await Rider.findOneAndUpdate(
  {
    riderId: booking.riderId,
  },
  {
  activeRide: false,
  currentBookingId: "",
  currentTripId: "",
  lastRideCompletedAt: new Date(),
}
);

    /*
|--------------------------------------------------------------------------
| Release Security Deposit Hold
|--------------------------------------------------------------------------
*/

const wallet = await Wallet.findOne({
  riderId: booking.riderId,
});

if (
  wallet &&
  Number(booking.securityDeposit || 0) > 0
) {

  wallet.securityDepositHold = Math.max(
    0,
    Number(wallet.securityDepositHold || 0) -
      Number(booking.securityDeposit || 0)
  );

  await wallet.save();

  await WalletTransaction.create({

    transactionId:
      "WTX-" + Date.now(),

    riderId: booking.riderId,

    userId: booking.userId,

    userName: booking.userName,

    bookingId: booking.bookingId,

    amount: booking.securityDeposit,

    paymentMethod: "Wallet",

    transactionType:
      "Security Deposit Release",

    balanceAfter: wallet.balance,

    remarks:
      "Ride completed",

    status: "Success",

  });

}

/*
|--------------------------------------------------------------------------
| Create Refund Request
|--------------------------------------------------------------------------
*/

if (
  Number(booking.securityDeposit || 0) > 0
) {

  const existingRefund =
    await Refund.findOne({
      bookingId: booking.bookingId,
    });

  if (!existingRefund) {

    await Refund.create({

      refundId:
        "RF-" + Date.now(),

      bookingId:
        booking.bookingId,

      riderId:
        booking.riderId,

      amount:
        booking.securityDeposit,

      refundStatus:
        "PENDING",

      remarks:
        "Security deposit refund pending admin approval",

    });

    booking.refundAmount = Number(booking.securityDeposit || 0);
booking.securityDepositRefunded = false;

  }

}

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Ride completed successfully.",
      data: booking,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete ride.", 
      },
      { status: 500 }
    );
  }
}