import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Vehicle from "@/models/Vehicle";
import Rider from "@/models/Rider";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { bookingId, endHub, rideEndOTP } = await req.json();

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

booking.otpVerifiedAt = new Date();

booking.rideEndOTP = "";

booking.rideEndOTPExpiry = null;

    await booking.save();

    await Vehicle.findOneAndUpdate(
      {
        vehicleId: booking.vehicleId,
      },
      {
        vehicleStatus: "Available",
        currentHub: endHub || booking.startHub,
        currentBookingId: "",
        currentRiderId: "",
        assignedRider: "",
        lockStatus: "Locked",
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