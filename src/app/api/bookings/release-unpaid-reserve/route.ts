import { NextResponse } from "next/server";

import { cancelUnpaidPrePaymentReserve } from "@/lib/cancelUnpaidPrePaymentReserve";
import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { isUnpaidPrePaymentReserve } from "@/lib/unpaidPrePaymentReserve";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
      return NextResponse.json(
        { success: false, message: "Rider profile not found." },
        { status: 404 }
      );
    }

    const belongs = bookingBelongsToRiderFilter(rider);
    const reserve = await Booking.findOne({
      $and: [
        belongs,
        NOT_DELETED_FILTER,
        { rideStatus: { $nin: ["Cancelled", "Completed"] } },
        { paymentStatus: "Pending" },
        { receivedAmount: { $lte: 0 } },
        { pickupOTPVerified: { $ne: true } },
        { rideStatus: { $in: ["Booked", "Reserved", "Payment Pending"] } },
      ],
    })
      .sort({ createdAt: -1 })
      .select("bookingId");

    if (!reserve?.bookingId || !isUnpaidPrePaymentReserve(reserve.toObject())) {
      return NextResponse.json({
        success: true,
        released: false,
        message: "No unpaid reserve to release.",
      });
    }

    const result = await cancelUnpaidPrePaymentReserve(
      String(reserve.bookingId),
      "Rider opened a new normal booking without paying for the previous reserve"
    );

    return NextResponse.json({
      success: true,
      released: result.cancelled,
      bookingId: result.cancelled ? result.bookingId : undefined,
    });
  } catch (error) {
    console.error("RELEASE UNPAID RESERVE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to release the previous reserve." },
      { status: 500 }
    );
  }
}
