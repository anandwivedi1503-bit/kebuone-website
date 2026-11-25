import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { applyCreatedCursor, listResponseFromPage, parseListQuery, withNextCursor } from "@/lib/listQuery";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Transaction from "@/models/Transaction";

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
      $and: [NOT_DELETED_FILTER, { riderId: rider.riderId }],
    })
      .select("bookingId")
      .lean();
    const ids = bookings.map((row) => row.bookingId).filter(Boolean);

    const parsed = parseListQuery(req);
    const limit = Math.min(parsed.limit, 100);
    const filter: Record<string, unknown> = {
      bookingId: { $in: ids },
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    };
    applyCreatedCursor(filter, parsed.cursor);
    const rows = await Transaction.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(parsed.cursor ? 0 : parsed.skip)
      .limit(limit + 1)
      .select(
        "transactionId bookingId amount gstAmount cgstAmount sgstAmount paymentMethod invoiceNumber remarks createdAt status"
      )
      .lean();
    const payload = listResponseFromPage(rows, parsed.cursor ? 1 : parsed.page, limit);

    return NextResponse.json(
      withNextCursor(
        payload,
        payload.data[payload.data.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined
      )
    );
  } catch (error) {
    console.error("RECEIPTS MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load receipts." },
      { status: 500 }
    );
  }
}
