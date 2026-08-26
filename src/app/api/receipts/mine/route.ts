import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
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

    const receipts = await Transaction.find({
      bookingId: { $in: ids },
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .limit(40)
      .select(
        "transactionId bookingId amount gstAmount cgstAmount sgstAmount paymentMethod invoiceNumber remarks createdAt status"
      )
      .lean();

    return NextResponse.json({ success: true, data: receipts });
  } catch (error) {
    console.error("RECEIPTS MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load receipts." },
      { status: 500 }
    );
  }
}
