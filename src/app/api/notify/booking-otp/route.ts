import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export const runtime = "nodejs";

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

export async function POST(req: Request) {
  try {
    const firebaseUser = await getVerifiedFirebaseUser(req);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    await connectDB();

    let requestedBookingId = "";
    try {
      const body = (await req.json()) as { bookingId?: string };
      requestedBookingId = String(body?.bookingId || "").trim();
    } catch {
      requestedBookingId = "";
    }

    const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
      { firebaseUid: firebaseUser.uid },
    ];
    if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

    const rider = await Rider.findOne({
      $and: [NOT_DELETED, { $or: riderLookups }],
    });

    if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
      return NextResponse.json(
        { success: false, message: "Rider not found." },
        { status: 404 }
      );
    }

    const booking = requestedBookingId
      ? await Booking.findOne({
          bookingId: requestedBookingId,
          riderId: rider.riderId,
          $and: [NOT_DELETED, { rideStatus: { $ne: "Cancelled" } }],
        })
      : await Booking.findOne({
          riderId: rider.riderId,
          $and: [NOT_DELETED, { rideStatus: { $ne: "Cancelled" } }],
        }).sort({ createdAt: -1 });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "No booking found." },
        { status: 404 }
      );
    }

    const pickupOTP = booking.pickupOTPVerified
      ? ""
      : String(booking.pickupOTP || "");
    const rideEndOTP = booking.rideEndOTPVerified
      ? ""
      : String(booking.rideEndOTP || "");

    if (!pickupOTP && !rideEndOTP) {
      return NextResponse.json({
        success: false,
        message: "No OTP to send yet.",
      });
    }

    const result = await notifyBookingPayment({
      bookingId: booking.bookingId,
      riderName: String(booking.userName || rider.fullName || ""),
      riderPhone: String(booking.userPhone || rider.phone || ""),
      riderEmail: String(booking.userEmail || rider.email || ""),
      amount: Number(booking.receivedAmount || 0),
      pendingAmount: Number(booking.pendingAmount || 0),
      paymentStatus: String(booking.paymentStatus || ""),
      pickupOTP: pickupOTP || undefined,
      rideEndOTP: rideEndOTP || undefined,
      paymentMethod: "Razorpay",
    });

    return NextResponse.json({
      success: result.sms || result.email || result.whatsapp,
      sms: result.sms,
      message: result.sms
        ? `OTP sent to ${String(booking.userPhone || rider.phone).slice(-10)}.`
        : "Could not send SMS. Check MSG91, Fast2SMS, or Twilio keys on the server. OTP is still on this page.",
    });
  } catch (error) {
    console.error("NOTIFY BOOKING OTP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send OTP SMS." },
      { status: 500 }
    );
  }
}
