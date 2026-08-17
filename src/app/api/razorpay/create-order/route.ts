import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

function clean(value: unknown) {
  return String(value || "").trim();
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
}

function getRazorpayErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: { description?: unknown } }).error
      ?.description === "string"
  ) {
    return (error as { error: { description: string } }).error.description;
  }

  return error instanceof Error ? error.message : "";
}

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay key id or key secret is missing.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const bookingMongoId = clean(body.bookingMongoId);
    const requestedAmount = parseAmount(body.amount);

    if (!bookingMongoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(bookingMongoId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    const isAdminRequest = await isAdminAuthenticated();

    if (!isAdminRequest) {
      const firebaseUser = await getVerifiedFirebaseUser(
        req,
        body.firebaseIdToken
      );

      if (!firebaseUserOwnsRider(firebaseUser, rider)) {
        return unauthorizedResponse();
      }
    }

    if (!rider.bookingEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking is not enabled for this rider.",
        },
        { status: 403 }
      );
    }

    if (rider.status !== "Active") {
      return NextResponse.json(
        {
          success: false,
          message: "Rider account is not active.",
        },
        { status: 403 }
      );
    }

    if (
      rider.currentBookingId &&
      rider.currentBookingId !== booking.bookingId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider already has another active booking.",
        },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "Paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking already paid.",
        },
        { status: 400 }
      );
    }

    if (
      booking.rideStatus === "Cancelled" ||
      booking.rideStatus === "Completed" ||
      booking.rideStatus === "Ready For Pickup" ||
      booking.rideStatus === "In Ride"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment cannot be made for this booking.",
        },
        { status: 400 }
      );
    }

    const payableAmount =
      Number(booking.securityDeposit || 0) +
      Number(booking.totalAmount || 0);

    const receivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Number(
      (payableAmount - receivedAmount).toFixed(2)
    );

    if (remainingAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This booking has already been fully paid.",
        },
        { status: 400 }
      );
    }

    const amount = requestedAmount || remainingAmount;

    if (amount < 1 || amount > remainingAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Enter a valid amount between INR 1 and INR ${remainingAmount}.`,
        },
        { status: 400 }
      );
    }

    if (booking.riderId !== rider.riderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking rider mismatch.",
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: String(`booking_${booking.bookingId}_${Date.now()}`).slice(
        0,
        40
      ),
      notes: {
        bookingMongoId,
        bookingId: booking.bookingId,
        vehicleId: booking.vehicleId || "",
        payableAmount: String(payableAmount),
        remainingAmount: String(remainingAmount),
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return NextResponse.json({
      success: true,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      payableAmount,
      remainingAmount,
    });
  } catch (error: unknown) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          getRazorpayErrorMessage(error) ||
          "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
