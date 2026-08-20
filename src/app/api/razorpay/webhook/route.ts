import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { connectDB } from "@/lib/mongodb";
import { applyCapturedRazorpayPayment } from "@/lib/razorpay/applyCapturedPayment";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  if (!signaturesMatch(expected, signature)) {
    return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: string;
          notes?: Record<string, string>;
        };
      };
    };
  };

  if (payload.event !== "payment.captured") {
    return NextResponse.json({ success: true, ignored: true });
  }

  const payment = payload.payload?.payment?.entity;
  const razorpayPaymentId = String(payment?.id || "");
  const razorpayOrderId = String(payment?.order_id || "");

  if (!razorpayPaymentId || !razorpayOrderId) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  await connectDB();

  const live = await new Razorpay({ key_id: keyId, key_secret: keySecret }).payments.fetch(
    razorpayPaymentId
  );

  if (!live || live.status !== "captured" || live.order_id !== razorpayOrderId) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const order = (await new Razorpay({ key_id: keyId, key_secret: keySecret }).orders.fetch(
    razorpayOrderId
  )) as { notes?: Record<string, string> };

  const bookingMongoId = String(
    live.notes?.bookingMongoId || order.notes?.bookingMongoId || ""
  );

  const booking = bookingMongoId
    ? await Booking.findById(bookingMongoId)
    : await Booking.findOne({ razorpayOrderId });

  if (!booking) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const result = await applyCapturedRazorpayPayment({
    bookingMongoId: String(booking._id),
    razorpayOrderId,
    razorpayPaymentId,
    paidAmount: Number(live.amount || 0) / 100,
  });

  if (!result.ok && result.status >= 500) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
