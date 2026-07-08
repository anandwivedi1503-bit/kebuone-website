import Rider from "@/models/Rider";
import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

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
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay keys are not configured." },
        { status: 500 }
      );
    }

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

    const existingTransaction = await Transaction.findOne({
      transactionId: razorpayPaymentId,
    });

    if (existingTransaction) {
      const currentBooking = await Booking.findById(bookingMongoId);

      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        data: currentBooking,
        paidAmount: existingTransaction.amount,
        pendingAmount: currentBooking?.pendingAmount || 0,
        paymentStatus: currentBooking?.paymentStatus || "Paid",
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

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
    const booking = await Booking.findById(bookingMongoId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const payableAmount = Number(booking.securityDeposit || 0) + Number(booking.totalAmount || 0);
    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(Number((payableAmount - oldReceivedAmount).toFixed(2)), 0);

    if (paidAmount < 1 || paidAmount > remainingAmount) {
      return NextResponse.json(
        { success: false, message: "Payment amount does not match booking balance." },
        { status: 400 }
      );
    }

    const newReceivedAmount = Number((oldReceivedAmount + paidAmount).toFixed(2));
    const pendingAmount = Math.max(Number((payableAmount - newReceivedAmount).toFixed(2)), 0);
    const paymentStatus = pendingAmount <= 0 ? "Paid" : "Partial";

    await Transaction.create({
      transactionId: razorpayPaymentId,
      bookingId: booking.bookingId,
      userId: booking.userPhone || booking.userId || "Rider",
      userName: booking.userName || "Rider",
      amount: paidAmount,
      gstAmount: Number((Number(booking.totalAmount || 0) * 0.05).toFixed(2)),
      paymentMethod: "Razorpay",
      transactionType: "Booking Payment",
      status: "Success",
    });

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingMongoId,
      {
        receivedAmount: newReceivedAmount,
        pendingAmount,
        paymentMode: "Razorpay",
        paymentStatus,
        paymentDate: new Date(),
        razorpayOrderId,
razorpayPaymentId,
        remarks: `${booking.remarks || ""}

Razorpay paid INR ${paidAmount}
Order: ${razorpayOrderId}
Payment: ${razorpayPaymentId}`,
      },
      { new: true }
    );
    await Rider.findOneAndUpdate(
  { riderId: booking.riderId },
  {
    $inc: {
      totalEarnings: paidAmount,
    },
  }
);

    return NextResponse.json({
      success: true,
      message:
        paymentStatus === "Paid"
          ? "Payment verified successfully."
          : "Partial payment verified successfully.",
      data: updatedBooking,
      paidAmount,
      pendingAmount,
      paymentStatus,
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Payment verification failed." },
      { status: 500 }
    );
  }
}