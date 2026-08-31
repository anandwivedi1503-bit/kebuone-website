import crypto from "crypto";
import { NextResponse } from "next/server";

import { isAdminAuthenticated, requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { getRazorpayClient, getRazorpayConfig } from "@/lib/razorpay/config";
import { connectDB } from "@/lib/mongodb";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
  riderPayUnauthorizedResponse,
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCapturedPayment(
  razorpay: ReturnType<typeof getRazorpayClient>,
  razorpayPaymentId: string,
  razorpayOrderId: string
) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment?.order_id && payment.order_id !== razorpayOrderId) {
      return null;
    }
    if (payment?.status === "captured") {
      return payment;
    }
    if (payment?.status === "authorized") {
      await sleep(800);
      continue;
    }
    await sleep(800);
  }
  return razorpay.payments.fetch(razorpayPaymentId);
}

function applyResultResponse(result: Awaited<ReturnType<typeof applyCapturedRazorpayPayment>>) {
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message },
      { status: result.status }
    );
  }

  const bookingRecord = (result.booking || {}) as {
    receivedAmount?: number;
    pendingAmount?: number;
    paymentStatus?: string;
    paymentDue?: number;
    pickupOTP?: string;
  };

  return NextResponse.json({
    success: true,
    message: result.message,
    data: result.booking,
    booking: result.booking,
    paidAmount: result.paidAmount,
    receivedAmount: Number(bookingRecord.receivedAmount || 0),
    pendingAmount: result.pendingAmount,
    paymentDue: Number(bookingRecord.paymentDue || 0),
    paymentStatus: result.paymentStatus,
    pickupOTP:
      result.pickupOTP ||
      String(bookingRecord.pickupOTP || "") ||
      undefined,
    rideEndOTP: result.rideEndOTP,
  });
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
    const recover = body.recover === true;
    const razorpayOrderId = clean(body.razorpay_order_id);
    const razorpayPaymentId = clean(body.razorpay_payment_id);
    const razorpaySignature = clean(body.razorpay_signature);

    if (!bookingMongoId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required." },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(bookingMongoId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, message: "Rider not found." },
        { status: 404 }
      );
    }

    const isAdminRequest = await isAdminAuthenticated().catch(() => false);
    const firebaseUser = await getVerifiedFirebaseUser(req, body.firebaseIdToken);
    const riderOwns = firebaseUserOwnsRider(firebaseUser, {
      firebaseUid: rider.firebaseUid,
      phone: rider.phone,
      userPhone: booking.userPhone,
    });
    if (isAdminRequest && !riderOwns) {
      const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
      if (gate.error) return gate.error;
    }

    const razorpay = getRazorpayClient();

    if (recover) {
      if (!isAdminRequest && !riderOwns) {
        return riderPayUnauthorizedResponse();
      }

      const orderId = razorpayOrderId || String(booking.razorpayOrderId || "");
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: "No Razorpay order found for this booking." },
          { status: 400 }
        );
      }

      const payments = (await razorpay.orders.fetchPayments(orderId)) as {
        items?: Array<{ id?: string; status?: string }>;
      };
      const captured = (payments.items || []).find((item) => item.status === "captured");
      if (!captured?.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Razorpay has not captured a payment for this booking yet.",
          },
          { status: 400 }
        );
      }

      const live = await waitForCapturedPayment(razorpay, String(captured.id), orderId);
      if (!live || live.status !== "captured") {
        return NextResponse.json(
          { success: false, message: "Payment is not captured yet." },
          { status: 400 }
        );
      }

      const result = await applyCapturedRazorpayPayment({
        bookingMongoId,
        razorpayOrderId: orderId,
        razorpayPaymentId: String(captured.id),
        paidAmount: Number(live.amount || 0) / 100,
      });
      return applyResultResponse(result);
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
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

    if (
      booking.razorpayOrderId &&
      booking.razorpayOrderId !== razorpayOrderId
    ) {
      return NextResponse.json(
        { success: false, message: "Booking payment order mismatch." },
        { status: 400 }
      );
    }

    const payment = await waitForCapturedPayment(
      razorpay,
      razorpayPaymentId,
      razorpayOrderId
    );

    if (!payment || payment.status !== "captured") {
      return NextResponse.json(
        { success: false, message: "Payment is not captured yet. Refresh this page — we will try to settle it." },
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

    if (
      String(order.notes?.bookingMongoId || "") &&
      String(order.notes?.bookingMongoId || "") !== bookingMongoId
    ) {
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
    return applyResultResponse(result);
  } catch (error) {
    console.error("RAZORPAY VERIFY PAYMENT ERROR:", error);
    const message =
      error instanceof Error && error.message
        ? error.message.slice(0, 180)
        : "Payment verification failed.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
