import crypto from "crypto";
import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { getRazorpayClient, getRazorpayConfig } from "@/lib/razorpay/config";
import { connectDB } from "@/lib/mongodb";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import { applyCapturedRazorpayPayment } from "@/lib/razorpay/applyCapturedPayment";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value || "").trim();
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(req: Request) {
  try {
    const loaded = getRazorpayConfig();
    if (!loaded.ok) {
      return NextResponse.json(
        { success: false, message: loaded.message },
        { status: 500 }
      );
    }
    const { keySecret } = loaded.config;

    const body = await req.json();
    const bookingMongoId = clean(body.bookingMongoId);
    const razorpayOrderId = clean(body.razorpay_order_id);
    const razorpayPaymentId = clean(body.razorpay_payment_id);
    const razorpaySignature = clean(body.razorpay_signature);

    if (!bookingMongoId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay payment details." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return NextResponse.json(
        { success: false, message: "Invalid Razorpay payment signature." },
        { status: 400 }
      );
    }

    await connectDB();

    const authBooking = await Booking.findById(bookingMongoId);

    if (!authBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    if (authBooking.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "Booking payment order mismatch." },
        { status: 400 }
      );
    }

    const authRider = await Rider.findOne({
      riderId: authBooking.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });

    if (!authRider) {
      return NextResponse.json(
        { success: false, message: "Rider not found." },
        { status: 404 }
      );
    }

    const isAdminRequest = await isAdminAuthenticated();

    if (!isAdminRequest) {
      const firebaseUser = await getVerifiedFirebaseUser(req, body.firebaseIdToken);
      if (!firebaseUserOwnsRider(firebaseUser, authRider)) {
        return unauthorizedResponse();
      }
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (!payment || payment.status !== "captured") {
      return NextResponse.json(
        { success: false, message: "Payment is not captured yet." },
        { status: 400 }
      );
    }

    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "Payment order mismatch." },
        { status: 400 }
      );
    }

    const order = (await razorpay.orders.fetch(razorpayOrderId)) as {
      notes?: Record<string, string | number | boolean>;
    };

    if (String(order.notes?.bookingMongoId || "") !== bookingMongoId) {
      return NextResponse.json(
        { success: false, message: "Payment booking mismatch." },
        { status: 400 }
      );
    }

    if (payment.notes?.bookingMongoId && payment.notes.bookingMongoId !== bookingMongoId) {
      return NextResponse.json(
        { success: false, message: "Payment booking mismatch." },
        { status: 400 }
      );
    }

    const paidAmount = Number(payment.amount || 0) / 100;
    const result = await applyCapturedRazorpayPayment({
      bookingMongoId,
      razorpayOrderId,
      razorpayPaymentId,
      paidAmount,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.booking,
      paidAmount: result.paidAmount,
      pendingAmount: result.pendingAmount,
      paymentStatus: result.paymentStatus,
      pickupOTP: result.pickupOTP,
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY PAYMENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed." },
      { status: 500 }
    );
  }
}
