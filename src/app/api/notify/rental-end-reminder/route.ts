import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { notifyRentalEndReminder } from "@/lib/notify/rentalEndReminder";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
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

    if (
      !(await rateLimitAllowed(`rental-rem:${firebaseUser.uid}`, 6, 60 * 60 * 1000))
    ) {
      return NextResponse.json(
        { success: false, message: "Reminder already queued." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      bookingId?: string;
      phone?: string;
      endsAt?: string;
      rentalDuration?: string;
      rentalUnits?: number;
      leadMinutes?: number;
    };

    const bookingId = String(body.bookingId || "").trim();
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "bookingId required." },
        { status: 400 }
      );
    }

    await connectDB();

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

    const booking = await Booking.findOne({
      bookingId,
      riderId: rider.riderId,
      $and: [NOT_DELETED],
    });
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    if (booking.riderEndReminderSentAt) {
      return NextResponse.json({
        success: true,
        message: "Reminder already sent for this booking.",
      });
    }

    const endsAtIso =
      String(body.endsAt || "").trim() ||
      (booking.rentalEndDate
        ? new Date(booking.rentalEndDate).toISOString()
        : "");

    const result = await notifyRentalEndReminder({
      bookingId,
      riderName: String(booking.userName || rider.fullName || ""),
      riderPhone: String(body.phone || booking.userPhone || rider.phone || ""),
      riderEmail: String(booking.userEmail || rider.email || ""),
      endsAtIso,
      duration: String(body.rentalDuration || booking.rentalMode || ""),
      units: Number(body.rentalUnits) || undefined,
      leadMinutes: Number(body.leadMinutes) || 60,
    });

    booking.riderEndReminderSentAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      ...result,
      channels: [
        ...(result.emailSent ? ["email"] : []),
        ...(result.smsSent ? ["SMS"] : []),
      ],
    });
  } catch (error) {
    console.error("RENTAL END REMINDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send reminder." },
      { status: 500 }
    );
  }
}
