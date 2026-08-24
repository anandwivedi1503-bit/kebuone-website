import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { isOtpExpired } from "@/lib/otp";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

function clean(value: unknown) {
  return String(value || "").trim();
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

      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message:
          booking.rideStatus === "In Ride"
            ? "Pickup already confirmed. Ride is in progress."
            : "Pickup OTP already confirmed. Waiting for the rider to swipe Ride started.",
        pendingAmount: Number(booking.pendingAmount || 0),
        data: booking,
      });
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

    const pending = Number(booking.pendingAmount || 0);

    booking.pickupOTPVerified = true;
    booking.pickupOTPVerifiedAt = new Date();
    booking.pickupOTP = "";
    booking.pickupOTPExpiry = null;
    booking.rideStatus = "Ready For Pickup";

    await Vehicle.updateOne(
      {
        vehicleId: booking.vehicleId,
      },
      {
        $set: {
          vehicleStatus: "Ready For Pickup",
          lockStatus: "Unlocked",
          assignedRider: booking.riderId,
          currentBookingId: booking.bookingId,
          currentRiderId: booking.riderId,
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
      message:
        "Pickup OTP confirmed. Scooter unlocked. Rider must swipe Ride started on Book EV.",
      pendingAmount: pending,
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
