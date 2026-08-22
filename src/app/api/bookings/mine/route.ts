import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
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

export async function GET(req: Request) {
  try {
    const firebaseUser = await getVerifiedFirebaseUser(req);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    await connectDB();

    const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
      { firebaseUid: firebaseUser.uid },
    ];
    if (firebaseUser.phone) {
      riderLookups.push({ phone: firebaseUser.phone });
    }

    const rider = await Rider.findOne({
      $and: [NOT_DELETED, { $or: riderLookups }],
    });

    if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
      return NextResponse.json({ success: true, data: null });
    }

    const booking = await Booking.findOne({
      riderId: rider.riderId,
      $and: [
        NOT_DELETED,
        { rideStatus: { $ne: "Cancelled" } },
        {
          $or: [
            { paymentStatus: { $in: ["Pending", "Partial"] } },
            {
              rideStatus: {
                $in: [
                  "Booked",
                  "Reserved",
                  "Payment Pending",
                  "Ready For Pickup",
                  "In Ride",
                ],
              },
            },
          ],
        },
      ],
    })
      .select("-rideStartOTP -rideEndOTP")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: booking || null });
  } catch (error) {
    console.error("BOOKING MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your booking." },
      { status: 500 }
    );
  }
}
