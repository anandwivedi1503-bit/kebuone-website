import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";
import Rider from "@/models/Rider";

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

if (
  booking.rideEndOTPExpiry &&
  new Date() > new Date(booking.rideEndOTPExpiry)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Ride End OTP has expired.",
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
    
    await Rider.findOneAndUpdate(
      {
        riderId: booking.riderId,
      },
      {
        activeRide: false,
        currentBookingId: "",
      }
    );

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