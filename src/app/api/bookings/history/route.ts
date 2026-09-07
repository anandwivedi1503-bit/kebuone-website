import { NextResponse } from "next/server";

import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import { bookingEligibleForReview } from "@/lib/reviews";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
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
    if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

    const rider = await Rider.findOne({
      $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
    });

    if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const bookings = await Booking.find({
      $and: [
        bookingBelongsToRiderFilter(rider),
        NOT_DELETED_FILTER,
        {
          $or: [
            { rideStatus: "Completed" },
            { rideStatus: "Cancelled" },
            {
              rentalMode: "Rent To Own",
              receivedAmount: { $gt: 0 },
            },
          ],
        },
      ],
    })
      .select(
        "bookingId rideStatus rentalMode vehicleId vehicleModel startHub pickupCity pickupHubName receivedAmount pendingAmount completedAt actualRideEnd createdAt reviewId reviewedAt"
      )
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(25)
      .lean();

    const ids = bookings.map((row) => String(row.bookingId || "")).filter(Boolean);
    const reviews = ids.length
      ? await Review.find({
          ...NOT_DELETED_FILTER,
          bookingId: { $in: ids },
        })
          .select("bookingId stars status")
          .lean()
      : [];
    const byBooking = new Map(
      reviews.map((row) => [String(row.bookingId), row])
    );

    return NextResponse.json({
      success: true,
      data: bookings.map((row) => {
        const existing = byBooking.get(String(row.bookingId));
        return {
          ...row,
          canReview:
            bookingEligibleForReview({
              rideStatus: row.rideStatus,
              rentalMode: row.rentalMode,
              receivedAmount: row.receivedAmount,
            }) &&
            !existing &&
            !row.reviewId,
          reviewStars: existing?.stars || null,
          reviewStatus: existing?.status || null,
        };
      }),
    });
  } catch (error) {
    console.error("BOOKING HISTORY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load ride history." },
      { status: 500 }
    );
  }
}
