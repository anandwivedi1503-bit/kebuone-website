import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

function clean(value: unknown) {
  return String(value || "").trim();
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
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

    const payableAmount =
      Number(booking.securityDeposit || 0) + Number(booking.totalAmount || 0);

    const receivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Number((payableAmount - receivedAmount).toFixed(2));

    const amount = requestedAmount || remainingAmount;

    if (!amount || amount < 1 || amount > remainingAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Enter a valid amount between ₹1 and ₹${remainingAmount}.`,
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
      receipt: String(`booking_${booking.bookingId}_${Date.now()}`).slice(0, 40),
      notes: {
        bookingMongoId,
        bookingId: booking.bookingId,
        vehicleId: booking.vehicleId || "",
        payableAmount: String(payableAmount),
        remainingAmount: String(remainingAmount),
      },
    });

    return NextResponse.json({
      success: true,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      payableAmount,
      remainingAmount,
    });
  } catch (error: any) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}