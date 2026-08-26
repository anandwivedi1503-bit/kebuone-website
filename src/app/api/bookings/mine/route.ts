import { NextResponse } from "next/server";

import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { openDueRtoInstallment } from "@/lib/rtoInstallmentCycle";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export const runtime = "nodejs";

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
      $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
    });

    if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
      return NextResponse.json({ success: true, data: null });
    }

    const activeFilter = {
      $and: [
        bookingBelongsToRiderFilter(rider),
        NOT_DELETED_FILTER,
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
    };

    const activeDoc = await Booking.findOne(activeFilter)
      .select("-rideStartOTP")
      .sort({ createdAt: -1 });

    let booking = activeDoc ? activeDoc.toObject() : null;
    if (activeDoc) {
      await openDueRtoInstallment(activeDoc);
      booking = activeDoc.toObject();
    }

    if (!booking) {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
      booking = await Booking.findOne({
        $and: [
          bookingBelongsToRiderFilter(rider),
          NOT_DELETED_FILTER,
          { rideStatus: "Completed" },
          {
            $or: [
              { completedAt: { $gte: since } },
              { actualRideEnd: { $gte: since } },
            ],
          },
        ],
      })
        .select("-rideStartOTP")
        .sort({ completedAt: -1, createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ success: true, data: booking || null });
  } catch (error) {
    console.error("BOOKING MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your booking." },
      { status: 500 }
    );
  }
}
