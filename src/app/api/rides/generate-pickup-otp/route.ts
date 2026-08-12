import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Booking from "@/models/Booking";

export async function POST(req: Request) {
  try {

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
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
          message: "Booking payment is pending.",
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

    let otp = booking.pickupOTP;

if (!otp) {

  otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  booking.pickupOTP = otp;

}

    // Temporary: keep generated time for audit
    booking.pickupOTPVerified = false;
    booking.pickupOTPVerifiedAt = null;

    await booking.save();

    return NextResponse.json({
      success: true,
      pickupOTP: otp,
      message: "Pickup OTP generated successfully.",
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