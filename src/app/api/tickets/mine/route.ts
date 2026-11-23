import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Rider from "@/models/Rider";
import Booking from "@/models/Booking";
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

    const requestedBookingId = String(
      new URL(req.url).searchParams.get("bookingId") || ""
    )
      .trim()
      .toUpperCase();
    const riderCurrentBookingId = String(rider.currentBookingId || "")
      .trim()
      .toUpperCase();

    const currentBookingFilter = {
      $and: [
        NOT_DELETED_FILTER,
        bookingBelongsToRiderFilter(rider),
        { rideStatus: { $nin: ["Completed", "Cancelled"] } },
      ],
    };
    const currentBooking = requestedBookingId
      ? await Booking.findOne({
          $and: [...currentBookingFilter.$and, { bookingId: requestedBookingId }],
        })
          .select("bookingId")
          .lean()
      : riderCurrentBookingId
        ? (await Booking.findOne({
            $and: [...currentBookingFilter.$and, { bookingId: riderCurrentBookingId }],
          })
            .select("bookingId")
            .lean()) ||
          (await Booking.findOne(currentBookingFilter)
            .select("bookingId")
            .sort({ updatedAt: -1 })
            .lean())
        : await Booking.findOne(currentBookingFilter)
            .select("bookingId")
            .sort({ updatedAt: -1 })
            .lean();
    if (!currentBooking) {
      return NextResponse.json({ success: true, data: [] });
    }
    const bookingId = String(
      (currentBooking as Record<string, unknown>).bookingId || ""
    )
      .trim()
      .toUpperCase();
    if (!bookingId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const tickets = await Ticket.find({
      $and: [
        NOT_DELETED_FILTER,
        { bookingId },
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
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(20)
      .select(
        "ticketId bookingId category status description adminRemarks createdAt updatedAt resolvedAt closedAt"
      )
      .lean();

    const data = tickets.map((row) => {
      const remarks = String(row.adminRemarks || "").trim();
      return {
        ...row,
        supportReply: remarks || undefined,
        hasSupportReply: remarks.length > 0,
        supportReplyAt: remarks ? row.updatedAt : undefined,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("TICKETS MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your tickets." },
      { status: 500 }
    );
  }
}
