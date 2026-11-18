import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import { queueDepositRefundIfEligible, existingDepositRefundFilter } from "@/lib/queueDepositRefund";
import { firebaseUserOwnsRider, getVerifiedFirebaseUser } from "@/lib/requestAuth";

export function isRiderDepositRequest(body: Record<string, unknown>) {
  const type = String(body.type || "").trim().toLowerCase();
  const reason = String(body.reason || "");
  return type === "security_deposit" || /security deposit refund/i.test(reason);
}

/** Rider app already posts this shape. Success keeps the screen on a note instead of an error. */
export async function handleRiderDepositRequest(req: Request, body: Record<string, unknown>) {
  await connectDB();
  const user = await getVerifiedFirebaseUser(req, body.firebaseIdToken);
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in again with your registered mobile number.",
      },
      { status: 401 }
    );
  }

  const bookingId = String(body.bookingId || "").trim();
  if (!bookingId) {
    return NextResponse.json(
      { success: false, message: "No booking is linked to this deposit yet." },
      { status: 400 }
    );
  }

  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    return NextResponse.json(
      { success: false, message: "Booking not found." },
      { status: 404 }
    );
  }

  const rider = await Rider.findOne({ riderId: booking.riderId });
  if (!rider || !firebaseUserOwnsRider(user, rider)) {
    return NextResponse.json(
      {
        success: false,
        message: "Please sign in again with your registered mobile number.",
      },
      { status: 401 }
    );
  }

  if (String(booking.rideStatus || "") !== "Completed") {
    return NextResponse.json({
      success: true,
      message:
        "Your deposit stays held until the yard marks the scooter returned. Finance then sends it to the original Razorpay payment.",
    });
  }

  if (Number(booking.pendingAmount || 0) > 0.009) {
    return NextResponse.json({
      success: true,
      message:
        "Pay the remaining fare first. The deposit is returned only after the balance is zero and the yard has closed the ride.",
    });
  }

  if (String(booking.rentalMode || "") === "Rent To Own") {
    return NextResponse.json({
      success: true,
      message: "Rent to Own deposits stay on the agreement until ownership or a finance review.",
    });
  }

  let row = await Refund.findOne(existingDepositRefundFilter(booking.bookingId));
  if (!row) {
    await queueDepositRefundIfEligible(booking);
    row = await Refund.findOne(existingDepositRefundFilter(booking.bookingId));
  }

  return NextResponse.json({
    success: true,
    refundId: row?.refundId || "",
    message:
      String(row?.refundStatus || "") === "REFUNDED"
        ? "This security deposit is already refunded to you."
        : "Security deposit refund is queued. Finance sends it to your original Razorpay payment from the Refunds desk.",
  });
}
