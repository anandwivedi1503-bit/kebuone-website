import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
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

    const reviews = await Review.find({
      $and: [NOT_DELETED_FILTER, { riderId: rider.riderId }],
    })
      .sort({ createdAt: -1 })
      .limit(40)
      .select(
        "reviewId bookingId stars vehicleStars hubStars comment wouldRecommend status staffReply createdAt hubCode city"
      )
      .lean();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("REVIEWS MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your reviews." },
      { status: 500 }
    );
  }
}
