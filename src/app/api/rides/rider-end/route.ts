import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
import { generateSixDigitOtp, rideEndOtpExpiry } from "@/lib/otp";
import { getOwnedActiveBooking } from "@/lib/ownedActiveBooking";
import { writeAudit } from "@/lib/writeAudit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const owned = await getOwnedActiveBooking(req);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, message: owned.message },
        { status: owned.status }
      );
    }

    const { booking, rider } = owned;
    const pending = Number(booking.pendingAmount || 0);

    if (booking.rideStatus !== "In Ride") {
      return NextResponse.json(
        {
          success: false,
          message: "Start the ride first, then swipe Ride end when you return to the yard.",
        },
        { status: 400 }
      );
    }

    if (pending > 0.009) {
      return NextResponse.json(
        {
          success: false,
          message: `Pay remaining ₹${pending.toFixed(2)} before ride end OTP is issued.`,
        },
        { status: 400 }
      );
    }

    const existing = String(booking.rideEndOTP || "").trim();
    const rideEndOTP = existing || generateSixDigitOtp();
    booking.rideEndOTP = rideEndOTP;
    booking.rideEndOTPExpiry = booking.rideEndOTPExpiry || rideEndOtpExpiry();
    booking.rideEndOTPVerified = false;
    booking.riderReturnedAt = booking.riderReturnedAt || new Date();
    await booking.save();

    void writeAudit({
      actor: "Rider",
      action: "RIDER_SWIPE_END",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: rider.riderId,
      bookingId: booking.bookingId,
      detail: "Rider swiped Ride end. Ride end OTP issued for the yard.",
    });

    try {
      await notifyBookingPayment({
        bookingId: booking.bookingId,
        riderName: String(booking.userName || rider.fullName || ""),
        riderPhone: String(booking.userPhone || rider.phone || ""),
        riderEmail: String(booking.userEmail || rider.email || ""),
        amount: Number(booking.receivedAmount || 0),
        pendingAmount: 0,
        paymentStatus: String(booking.paymentStatus || "Paid"),
        rideEndOTP,
        paymentMethod: "Razorpay",
      });
    } catch (notifyError) {
      console.error("RIDE END OTP NOTIFY ERROR:", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "Ride end OTP is ready. Tell this to the yard to return the scooter.",
      rideEndOTP,
      rideStatus: booking.rideStatus,
      riderReturnedAt: booking.riderReturnedAt,
      data: booking,
    });
  } catch (error) {
    console.error("RIDER END RIDE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to issue ride end OTP." },
      { status: 500 }
    );
  }
}
