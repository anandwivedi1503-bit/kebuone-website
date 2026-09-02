import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  requireAdminDashboards,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { findBookingRider, syncBookingRiderId } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { generateSixDigitOtp, isOtpExpired, otpMatches } from "@/lib/otp";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { queueDepositRefundIfEligible } from "@/lib/queueDepositRefund";
import { isRentToOwnBooking } from "@/lib/rtoInstallmentCycle";
import {
  hubForbiddenResponse,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";

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
    await connectDB();
    const gate = await requireAdminDashboards(...API_DASHBOARDS.yardRide);
    if (gate.error) return gate.error;

    const { bookingId, endHub, rideEndOTP } = await req.json();
    if (!endHub?.trim()) {
      return NextResponse.json(
        { success: false, message: "End Hub is required." },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID required." },
        { status: 400 }
      );
    }

    if (!rideEndOTP) {
      return NextResponse.json(
        { success: false, message: "Ride End OTP is required." },
        { status: 400 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne({ bookingId }).session(session);

    if (!booking) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    if (!staffCanAccessBooking(gate.session, booking)) {
      await rollback(session);
      return hubForbiddenResponse();
    }

    if (isRentToOwnBooking(booking) && !booking.ownershipTransferred) {
      await rollback(session);
      return NextResponse.json(
        {
          success: false,
          message:
            "Rent to Own scooters stay with the rider. Do not take this bike back unless the contract is cancelled by admin.",
        },
        { status: 400 }
      );
    }

    if (isRentToOwnBooking(booking) && booking.ownershipTransferred) {
      await rollback(session);
      return NextResponse.json(
        {
          success: false,
          message:
            "Ownership has transferred. This scooter belongs to the rider — do not take it into the yard as a rental return.",
        },
        { status: 400 }
      );
    }

    if (Number(booking.pendingAmount || 0) > 0.009) {
      await rollback(session);
      return NextResponse.json(
        {
          success: false,
          message: `Pay remaining ₹${Number(booking.pendingAmount).toFixed(2)} before ride end OTP can be used.`,
        },
        { status: 400 }
      );
    }

    if (!booking.rideEndOTP) {
      await rollback(session);
      return NextResponse.json(
        {
          success: false,
          message: "Ride end OTP is issued only after the rider swipes Ride end on Book EV.",
        },
        { status: 400 }
      );
    }

    if (isOtpExpired(booking.rideEndOTPExpiry)) {
      await rollback(session);
      return NextResponse.json(
        {
          success: false,
          message: "Ride end OTP has expired. Ask the rider to swipe Ride end again on Book EV.",
        },
        { status: 400 }
      );
    }

    if (booking.rideEndOTPVerified) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Ride End OTP already used." },
        { status: 400 }
      );
    }

    if (!otpMatches(booking.rideEndOTP, rideEndOTP)) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Invalid Ride End OTP." },
        { status: 400 }
      );
    }

    if (booking.rideStatus !== "In Ride") {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Ride has not started." },
        { status: 400 }
      );
    }

    if (booking.actualRideEnd || booking.completedAt) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Ride has already been completed." },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findOne({
      vehicleId: booking.vehicleId,
    }).session(session);

    if (!vehicle) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Vehicle not found." },
        { status: 404 }
      );
    }

    if (vehicle.vehicleStatus !== "In Ride") {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Vehicle is not currently in ride." },
        { status: 400 }
      );
    }

    if (
      String(vehicle.currentBookingId || "").trim().toUpperCase() !==
      String(booking.bookingId || "").trim().toUpperCase()
    ) {
      await rollback(session);
      return NextResponse.json(
        { success: false, message: "Vehicle booking mismatch." },
        { status: 400 }
      );
    }

    const rider = await findBookingRider(booking, session);

    if (rider) {
      syncBookingRiderId(booking, rider);
      if (
        rider.currentBookingId &&
        rider.currentBookingId !== booking.bookingId
      ) {
        await rollback(session);
        return NextResponse.json(
          { success: false, message: "Rider booking mismatch." },
          { status: 400 }
        );
      }
    }

    booking.actualRideEnd = new Date();
    booking.completedAt = new Date();
    if (booking.actualRideStart) {
      booking.totalRideMinutes = Math.round(
        (booking.actualRideEnd.getTime() - new Date(booking.actualRideStart).getTime()) /
          60000
      );
    }
    booking.rideStatus = "Completed";
    booking.endHub = endHub || booking.startHub;
    booking.currentHub = endHub || booking.startHub;
    booking.rideEndOTPVerified = true;
    booking.rideEndOTPVerifiedAt = new Date();
    booking.rideEndOTP = "";
    booking.rideEndOTPExpiry = null;

    await Vehicle.findOneAndUpdate(
      { vehicleId: booking.vehicleId },
      {
        vehicleStatus: vehicle.batteryPercentage < 20 ? "Low Battery" : "Available",
        currentHub: endHub || booking.startHub,
        currentBookingId: "",
        currentRiderId: "",
        assignedRider: "",
        lockStatus: "Locked",
        rideEndedAt: new Date(),
      },
      { session }
    );

    if (rider) {
      await Rider.findOneAndUpdate(
        { _id: rider._id },
        {
          activeRide: false,
          currentBookingId: "",
          currentTripId: "",
          lastRideCompletedAt: new Date(),
        },
        { session }
      );
    }

    const wallet = await Wallet.findOne({
      riderId: booking.riderId,
    }).session(session);

    if (wallet && Number(booking.securityDeposit || 0) > 0) {
      wallet.securityDepositHold = Math.max(
        0,
        Number(wallet.securityDepositHold || 0) - Number(booking.securityDeposit || 0)
      );
      await wallet.save({ session });

      const existingRelease = await WalletTransaction.findOne({
        bookingId: booking.bookingId,
        transactionType: "Security Deposit Release",
      }).session(session);

      if (!existingRelease) {
        await WalletTransaction.create(
          [
            {
              transactionId: "WTX-" + generateSixDigitOtp() + Date.now(),
              riderId: booking.riderId,
              userId: booking.userId,
              userName: booking.userName,
              bookingId: booking.bookingId,
              amount: booking.securityDeposit,
              paymentMethod: "Wallet",
              transactionType: "Security Deposit Release",
              balanceAfter: wallet.balance,
              remarks: "Ride completed",
              status: "Success",
            },
          ],
          { session }
        );
      }
    }

    await queueDepositRefundIfEligible(booking, session);

    await booking.save({ session });
    await session.commitTransaction();
    session.endSession();

    const pending = Number(booking.pendingAmount || 0);
    return NextResponse.json({
      success: true,
      rideCompleted: true,
      message:
        "Scooter received. Thank you for riding with EVUDDY — we hope to see you again soon.",
      pendingAmount: pending,
      paymentStatus: booking.paymentStatus,
      data: booking,
    });
  } catch (error) {
    console.error(error);
    await rollback(session);
    return NextResponse.json(
      { success: false, message: "Unable to complete ride." },
      { status: 500 }
    );
  }
}
