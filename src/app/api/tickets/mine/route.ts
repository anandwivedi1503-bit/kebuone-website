import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";

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

    const tickets = await Ticket.find({
      $and: [
        NOT_DELETED_FILTER,
        {
          $or: [
            { riderId: rider.riderId },
            { riderPhone: rider.phone },
            { userId: rider.phone },
            { userId: rider.riderId },
          ],
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select(
        "ticketId bookingId category status description adminRemarks createdAt resolvedAt closedAt"
      )
      .lean();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("TICKETS MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your tickets." },
      { status: 500 }
    );
  }
}
