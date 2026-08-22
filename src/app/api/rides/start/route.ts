import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { isOtpExpired, generateSixDigitOtp } from "@/lib/otp";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

function clean(value: unknown) {
  return String(value || "").trim();
}

function generateRideEndOTP() {
  return generateSixDigitOtp();
}

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;

  try {
    await session.abortTransaction();
  } catch {}

  await session.endSession();
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { bookingId, pickupOTP } = await req.json();
    const normalizedBookingId = clean(bookingId).toUpperCase();
    const normalizedPickupOTP = clean(pickupOTP);

    if (!normalizedBookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID required.",
        },
        { status: 400 }
      );
    }

    if (!normalizedPickupOTP) {
      return NextResponse.json(
        {
          success: false,
          message: "Pickup OTP is required.",
        },
        { status: 400 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne({
      bookingId: normalizedBookingId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    }).session(session);

    if (!booking) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (Number(booking.receivedAmount || 0) < 1) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "At least one payment is required before starting the ride.",
        },
        { status: 400 }
      );
    }

    if (booking.pickupOTPVerified) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Pickup OTP already used.",
        },
        { status: 400 }
      );
    }

    if (booking.pickupOTP !== normalizedPickupOTP) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid Pickup OTP.",
        },
        { status: 400 }
      );
    }

    if (isOtpExpired(booking.pickupOTPExpiry)) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Pickup OTP has expired. Generate a new OTP.",
        },
        { status: 400 }
      );
    }

    if (booking.rideStatus !== "Ready For Pickup") {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking is not ready for pickup.",
        },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findOne({
      vehicleId: booking.vehicleId,
    }).session(session);

    if (!vehicle) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Vehicle not found.",
        },
        { status: 404 }
      );
    }

    if (
      !["Ready For Pickup", "Booked"].includes(
        String(vehicle.vehicleStatus || "")
      )
    ) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Vehicle is not ready for pickup.",
        },
        { status: 400 }
      );
    }

    if (vehicle.currentBookingId !== booking.bookingId) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Vehicle booking mismatch.",
        },
        { status: 400 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      isDeleted: false,
    }).session(session);

    if (!rider) {
      await rollback(session);
      session = null;

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
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider booking mismatch.",
        },
        { status: 400 }
      );
    }

    if (rider.activeRide) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider already has an active ride.",
        },
        { status: 400 }
      );
    }

    const rideEndOTP = generateRideEndOTP();

    booking.rideStatus = "In Ride";
    booking.actualRideStart = new Date();
    booking.completedAt = undefined;
    booking.pickupOTPVerified = true;
    booking.pickupOTPVerifiedAt = new Date();
    booking.pickupOTP = "";
    booking.pickupOTPExpiry = null;
    booking.rideEndOTP = rideEndOTP;
    booking.rideEndOTPExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    booking.rideEndOTPVerified = false;
    booking.rideEndOTPVerifiedAt = null;

    await Vehicle.updateOne(
      {
        vehicleId: booking.vehicleId,
      },
      {
        $set: {
          vehicleStatus: "In Ride",
          lockStatus: "Unlocked",
          assignedRider: booking.riderId,
          currentBookingId: booking.bookingId,
          currentRiderId: booking.riderId,
          rideStartedAt: new Date(),
        },
      },
      {
        session,
      }
    );

    await Rider.updateOne(
      {
        riderId: booking.riderId,
      },
      {
        $set: {
          activeRide: true,
          currentBookingId: booking.bookingId,
        },
      },
      {
        session,
      }
    );

    await booking.save({
      session,
    });

    await session.commitTransaction();
    await session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message: "Ride started successfully.",
      rideEndOTP,
      data: booking,
    });
  } catch (error) {
    console.error("START RIDE ERROR:", error);

    if (session) {
      await rollback(session);
      session = null;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start ride.",
      },
      { status: 500 }
    );
  }
}
