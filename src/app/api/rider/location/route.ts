import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { notifyOpsAlert } from "@/lib/notify/opsAlert";
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
      !(await rateLimitAllowed(`rider-loc:${firebaseUser.uid}`, 120, 10 * 60 * 1000)) ||
      !(await rateLimitAllowed(`rider-loc-ip:${clientIp(req)}`, 240, 10 * 60 * 1000))
    ) {
      return NextResponse.json(
        { success: false, message: "Too many location updates." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      bookingId?: string;
      latitude?: number;
      longitude?: number;
      accuracyMeters?: number;
      source?: string;
    };

    const bookingId = String(body.bookingId || "").trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    if (!bookingId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { success: false, message: "bookingId, latitude and longitude required." },
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
      $and: [NOT_DELETED, { rideStatus: { $nin: ["Completed", "Cancelled"] } }],
    });
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Active booking not found." },
        { status: 404 }
      );
    }

    booking.riderPhoneLat = latitude;
    booking.riderPhoneLng = longitude;
    booking.riderPhoneAccuracyM = Number(body.accuracyMeters) || undefined;
    booking.riderPhoneUpdatedAt = new Date();
    await booking.save();

    if (booking.rideStatus === "In Ride") {
      const end = booking.rentalEndDate ? new Date(booking.rentalEndDate) : null;
      const mins = end ? Math.round((end.getTime() - Date.now()) / 60000) : 999;
      if (mins <= 60 && mins >= 0) {
        void notifyOpsAlert(
          `SIREN · rider GPS · ${bookingId}`,
          `${booking.userName || rider.fullName} · ${latitude.toFixed(5)}, ${longitude.toFixed(5)} · ~${mins} min to rental end`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RIDER LOCATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to save rider location." },
      { status: 500 }
    );
  }
}
