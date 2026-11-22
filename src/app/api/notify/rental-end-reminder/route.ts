import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { notifyRentalEndReminder } from "@/lib/notify/rentalEndReminder";
import { rentalEndAtStart } from "@/lib/rentalSchedule";
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

    const endsAt = booking.actualRideStart
      ? rentalEndAtStart(
          new Date(booking.actualRideStart),
          String(booking.rentalMode || ""),
          Number(booking.rentalHours || 1),
          Number(booking.rentToOwnMonths || 20)
        )
      : null;
    const now = new Date();
    if (
      booking.rideStatus !== "In Ride" ||
      !endsAt ||
      endsAt <= now ||
      endsAt.getTime() > now.getTime() + 65 * 60 * 1000
    ) {
      return NextResponse.json(
        { success: false, message: "Reminder is only available during an active ride's final hour." },
        { status: 409 }
      );
    }

    const claimedAt = new Date();
    const claim = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        rideStatus: "In Ride",
        actualRideStart: booking.actualRideStart,
        riderEndReminderSentAt: { $exists: false },
        $or: [
          { riderEndReminderClaimedAt: { $exists: false } },
          { riderEndReminderClaimedAt: { $lt: new Date(now.getTime() - 15 * 60 * 1000) } },
        ],
      },
      {
        $set: {
          riderEndReminderClaimedAt: claimedAt,
          rentalEndDate: endsAt,
          expectedReturnDate: endsAt,
        },
      },
      { new: true }
    );
    if (!claim) {
      return NextResponse.json({ success: true, message: "Reminder is already being processed." });
    }

    const endsAtIso = claim.rentalEndDate
      ? new Date(claim.rentalEndDate).toISOString()
      : "";

    let result: Awaited<ReturnType<typeof notifyRentalEndReminder>>;
    try {
      result = await notifyRentalEndReminder({
        bookingId,
        riderName: String(claim.userName || rider.fullName || ""),
        riderPhone: String(claim.userPhone || rider.phone || ""),
        riderEmail: String(claim.userEmail || rider.email || ""),
        endsAtIso,
        duration: String(claim.rentalMode || ""),
        units:
          claim.rentalMode === "Hourly"
            ? Number(claim.rentalHours) || 1
            : undefined,
        leadMinutes: 60,
      });
    } catch (error) {
      await Booking.updateOne(
        { _id: claim._id, riderEndReminderClaimedAt: claimedAt },
        { $unset: { riderEndReminderClaimedAt: 1 } }
      );
      throw error;
    }

    if (result.emailSent || result.smsSent) {
      await Booking.updateOne(
        { _id: claim._id, riderEndReminderClaimedAt: claimedAt },
        { $set: { riderEndReminderSentAt: new Date() }, $unset: { riderEndReminderClaimedAt: 1 } }
      );
    } else {
      await Booking.updateOne(
        { _id: claim._id, riderEndReminderClaimedAt: claimedAt },
        { $unset: { riderEndReminderClaimedAt: 1 } }
      );
    }

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
