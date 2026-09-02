import crypto from "crypto";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { applyCapturedRazorpayPayment } from "@/lib/razorpay/applyCapturedPayment";
import { getRazorpayClient, getRazorpayConfig } from "@/lib/razorpay/config";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

type PaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
  notes?: Record<string, string>;
};

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(req: Request) {
  const loaded = getRazorpayConfig();
  if (!loaded.ok) {
    return NextResponse.json({ success: false, message: loaded.message }, { status: 500 });
  }

  if (!loaded.config.webhookSecret) {
    // Production must verify webhooks — fail closed so misconfig is visible.
    if (process.env.NODE_ENV === "production") {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing — webhook rejected.");
      return NextResponse.json(
        { success: false, message: "Webhook secret not configured." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: true, ignored: true });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = crypto
    .createHmac("sha256", loaded.config.webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (!signaturesMatch(expected, signature)) {
    return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: { entity?: PaymentEntity };
      order?: { entity?: { id?: string; notes?: Record<string, string> } };
    };
  };

  if (payload.event !== "payment.captured" && payload.event !== "order.paid") {
    return NextResponse.json({ success: true, ignored: true });
  }

  const paymentHint = payload.payload?.payment?.entity;
  let razorpayPaymentId = String(paymentHint?.id || "");
  let razorpayOrderId = String(
    paymentHint?.order_id || payload.payload?.order?.entity?.id || ""
  );

  if (!razorpayPaymentId && !razorpayOrderId) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const razorpay = getRazorpayClient();

  if (!razorpayPaymentId && razorpayOrderId) {
    const payments = (await razorpay.orders.fetchPayments(razorpayOrderId)) as {
      items?: Array<{ id?: string; status?: string }>;
    };
    const captured = (payments.items || []).find((item) => item.status === "captured");
    razorpayPaymentId = String(captured?.id || "");
  }

  if (!razorpayPaymentId || !razorpayOrderId) {
    return NextResponse.json({ success: true, ignored: true });
  }

  await connectDB();

  const live = await razorpay.payments.fetch(razorpayPaymentId);

  if (!live || live.status !== "captured" || live.order_id !== razorpayOrderId) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const order = (await razorpay.orders.fetch(razorpayOrderId)) as {
    notes?: Record<string, string>;
  };

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
