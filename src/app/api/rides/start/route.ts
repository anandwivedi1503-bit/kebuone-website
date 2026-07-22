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

    const { bookingId, pickupOTP } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID required.",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      bookingId,
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (booking.paymentStatus !== "Paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Complete payment first.",
        },
        { status: 400 }
      );
    }

    if (booking.pickupOTPVerified) {
  return NextResponse.json(
    {
      success: false,
      message: "Pickup OTP already used.",
    },
    { status: 400 }
  );
}

if (!pickupOTP) {
  return NextResponse.json(
    {
      success: false,
      message: "Pickup OTP is required.",
    },
    { status: 400 }
  );
}

if (booking.pickupOTP !== pickupOTP) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid Pickup OTP.",
    },
    { status: 400 }
  );
}

if (
  booking.pickupOTPExpiry &&
  new Date() > new Date(booking.pickupOTPExpiry)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Pickup OTP has expired.",
    },
    { status: 400 }
  );
}

    if (booking.rideStatus !== "Ready For Pickup") {
  return NextResponse.json(
    {
      success: false,
      message: "Booking is not ready for pickup.",
    },
    { status: 400 }
  );
}
      

    booking.rideStatus = "In Ride";
booking.actualRideStart = new Date();
booking.completedAt = undefined;

 booking.pickupOTPVerified = true;
 booking.pickupOTPVerifiedAt = new Date();
 booking.pickupOTP = "";
 booking.pickupOTPExpiry = null;

  

  booking.rideEndOTP = Math.floor(
   100000 + Math.random() * 900000
 ).toString();

booking.rideEndOTPExpiry = new Date(
  Date.now() + 24 * 60 * 60 * 1000
);

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

if (vehicle.vehicleStatus !== "Booked") {
  return NextResponse.json(
    {
      success: false,
      message: "Vehicle is not ready for pickup.",
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
  vehicleStatus: "In Ride",
  lockStatus: "Unlocked",
  assignedRider: booking.riderId,
  currentBookingId: booking.bookingId,
  currentRiderId: booking.riderId,
  rideStartedAt: new Date(),
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

if (rider.activeRide) {
  return NextResponse.json(
    {
      success: false,
      message: "Rider already has an active ride.",
    },
    { status: 400 }
  );
}

    await Rider.findOneAndUpdate(
      {
        riderId: booking.riderId,
      },
      {
        activeRide: true,
        currentBookingId: booking.bookingId,
      }
    );

    await booking.save();

    return NextResponse.json({
  success: true,
  message: "Ride started successfully.",
  rideEndOTP: booking.rideEndOTP,
  data: booking,
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start ride.",
      },
      { status: 500 }
    );
  }
}