import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import { generateSixDigitOtp, isOtpExpired, pickupOtpExpiry } from "@/lib/otp";
import Booking from "@/models/Booking";
import {
  hubForbiddenResponse,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";

export async function POST(req: Request) {
  try {

    const gate = await requireAdminDashboards(...API_DASHBOARDS.yardRide);
    if (gate.error) return gate.error;

    await connectDB();

    const { bookingId } = await req.json();
    const normalizedBookingId = String(bookingId || "")
      .trim()
      .toUpperCase();

    if (!normalizedBookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      bookingId: normalizedBookingId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
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

    if (!staffCanAccessBooking(gate.session, booking)) {
      return hubForbiddenResponse();
    }

    if (Number(booking.receivedAmount || 0) < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one payment is required before pickup OTP.",
        },
        { status: 400 }
      );
    }

    if (
      booking.rideStatus !== "Ready For Pickup" &&
      Number(booking.receivedAmount || 0) >= 1 &&
      ["Booked", "Reserved", "Payment Pending"].includes(String(booking.rideStatus))
    ) {
      booking.rideStatus = "Ready For Pickup";
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

    let otp = booking.pickupOTP;

    if (!otp || isOtpExpired(booking.pickupOTPExpiry)) {
      otp = generateSixDigitOtp();
      booking.pickupOTP = otp;
      booking.pickupOTPExpiry = pickupOtpExpiry();
      booking.pickupOTPVerified = false;
      booking.pickupOTPVerifiedAt = null;
      await booking.save();
    } else if (booking.isModified && booking.isModified()) {
      await booking.save();
    }

    return NextResponse.json({
      success: true,
      pickupOTPGenerated: true,
      message:
        "Pickup OTP is active on the rider's Book EV app. Enter the code they tell you — it is never shown here.",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate Pickup OTP.",
      },
      { status: 500 }
    );

  }
}