import crypto from "crypto";
import mongoose from "mongoose";
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
import Transaction from "@/models/Transaction";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

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

function generatePickupOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateWalletTransactionId() {
  return `WTX-${crypto.randomUUID().toUpperCase()}`;
}

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;

  try {
    await session.abortTransaction();
  } catch {}

  await session.endSession();
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay keys are not configured.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const bookingMongoId = clean(body.bookingMongoId);
    const razorpayOrderId = clean(body.razorpay_order_id);
    const razorpayPaymentId = clean(body.razorpay_payment_id);
    const razorpaySignature = clean(body.razorpay_signature);

    if (
      !bookingMongoId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Razorpay payment details.",
        },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Razorpay payment signature.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const authBooking = await Booking.findById(bookingMongoId);

    if (!authBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (authBooking.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking payment order mismatch.",
        },
        { status: 400 }
      );
    }

    const authRider = await Rider.findOne({
      riderId: authBooking.riderId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    });

    if (!authRider) {
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

      if (!firebaseUserOwnsRider(firebaseUser, authRider)) {
        return unauthorizedResponse();
      }
    }

    const existingTransaction = await Transaction.findOne({
      transactionId: razorpayPaymentId,
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        data: authBooking,
        paidAmount: existingTransaction.amount,
        pendingAmount: authBooking.pendingAmount || 0,
        paymentStatus: authBooking.paymentStatus || "Paid",
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (!payment || payment.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment is not captured yet.",
        },
        { status: 400 }
      );
    }

    if (payment.order_id !== razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment order mismatch.",
        },
        { status: 400 }
      );
    }

    const order = (await razorpay.orders.fetch(razorpayOrderId)) as {
      notes?: Record<string, string | number | boolean>;
    };

    if (String(order.notes?.bookingMongoId || "") !== bookingMongoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment booking mismatch.",
        },
        { status: 400 }
      );
    }

    if (
      payment.notes?.bookingMongoId &&
      payment.notes.bookingMongoId !== bookingMongoId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment booking mismatch.",
        },
        { status: 400 }
      );
    }

    const paidAmount = Number(payment.amount || 0) / 100;

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(bookingMongoId).session(session);

    if (!booking) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (booking.razorpayOrderId !== razorpayOrderId) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking payment order mismatch.",
        },
        { status: 400 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    }).session(session);

    if (!rider) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    const duplicateTransaction = await Transaction.findOne({
      transactionId: razorpayPaymentId,
    }).session(session);

    if (duplicateTransaction) {
      await session.commitTransaction();
      await session.endSession();
      session = null;

      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        data: booking,
        paidAmount: duplicateTransaction.amount,
        pendingAmount: booking.pendingAmount || 0,
        paymentStatus: booking.paymentStatus || "Paid",
      });
    }

    if (
      rider.currentBookingId &&
      rider.currentBookingId !== booking.bookingId
    ) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider already has another booking.",
        },
        { status: 400 }
      );
    }

    if (!rider.bookingEnabled) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking is disabled for this rider.",
        },
        { status: 403 }
      );
    }

    if (rider.status !== "Active") {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider account is not active.",
        },
        { status: 403 }
      );
    }

    if (booking.paymentStatus === "Paid" || booking.pendingAmount <= 0) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "This booking has already been fully paid.",
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
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "This booking is no longer payable.",
        },
        { status: 400 }
      );
    }

    const payableAmount =
      Number(booking.securityDeposit || 0) +
      Number(booking.totalAmount || 0);

    const oldReceivedAmount = Number(booking.receivedAmount || 0);
    const remainingAmount = Math.max(
      Number((payableAmount - oldReceivedAmount).toFixed(2)),
      0
    );

    if (paidAmount < 1 || paidAmount > remainingAmount) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Payment amount does not match booking balance.",
        },
        { status: 400 }
      );
    }

    const newReceivedAmount = Number(
      (oldReceivedAmount + paidAmount).toFixed(2)
    );
    const pendingAmount = Math.max(
      Number((payableAmount - newReceivedAmount).toFixed(2)),
      0
    );
    const paymentStatus = pendingAmount <= 0 ? "Paid" : "Partial";
    const rideStatus =
      pendingAmount <= 0 ? "Ready For Pickup" : "Payment Pending";
    const pickupOTP = pendingAmount <= 0 ? generatePickupOTP() : "";
    const invoiceNumber = `INV-${new Date().getFullYear()}-${
      booking.bookingId
    }`;

    await Transaction.create(
      [
        {
          transactionId: razorpayPaymentId,
          bookingId: booking.bookingId,
          userId: String(booking.userId || booking.userPhone || "Rider"),
          userName: booking.userName || "Rider",
          amount: paidAmount,
          gstAmount: Number((paidAmount * 0.05).toFixed(2)),
          paymentMethod: "Razorpay",
          razorpayOrderId,
          razorpayPaymentId,
          transactionType: "Booking Payment",
          invoiceNumber,
          invoiceGenerated: true,
          status: "Success",
        },
      ],
      {
        session,
      }
    );

    let wallet = await Wallet.findOne({
      riderId: rider.riderId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    }).session(session);

if (!wallet) {
  const [createdWallet] = await Wallet.create(
    [
      {
        riderId: rider.riderId,
        userId: rider._id,
        userName: rider.fullName,
        phone: rider.phone,
        balance: 0,
        securityDepositHold: 0,
        freezeAmount: 0,
        totalRecharge: 0,
        totalSpent: 0,
        totalRefund: 0,
        status: rider.bookingEnabled ? "Active" : "Blocked",
        adminBlocked: false,
        isDeleted: false,
        updatedBy: "System",
      },
    ],
    { session }
  );

  wallet = createdWallet;
}

    const existingDepositHold = await WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Hold",
    }).session(session);

    if (!existingDepositHold && pendingAmount <= 0) {
      wallet.securityDepositHold = Math.max(
        Number(wallet.securityDepositHold || 0),
        Number(booking.securityDeposit || 0)
      );

      await wallet.save({
        session,
      });

      await WalletTransaction.create(
        [
          {
            transactionId: generateWalletTransactionId(),
            riderId: booking.riderId,
            userId: booking.userId,
            userName: booking.userName,
            amount: Number(booking.securityDeposit || 0),
            transactionType: "Security Deposit Hold",
            paymentMethod: "Razorpay",
            bookingId: booking.bookingId,
            razorpayOrderId,
            razorpayPaymentId,
            balanceAfter: Number(wallet.balance || 0),
            remarks: "Security deposit held for bike booking.",
            status: "Success",
          },
        ],
        {
          session,
        }
      );
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingMongoId,
        paymentStatus: {
          $ne: "Paid",
        },
        razorpayOrderId,
      },
      {
        $set: {
          receivedAmount: newReceivedAmount,
          pendingAmount,
          paymentMode: "Razorpay",
          paymentStatus,
          rideStatus,
          pickupOTP,
          pickupOTPExpiry: null,
          pickupOTPVerified: false,
          pickupOTPVerifiedAt: null,
          rideStartOTP: "",
          rideStartOTPExpiry: null,
          rideStartOTPVerified: false,
          rideEndOTP: "",
          rideEndOTPExpiry: null,
          rideEndOTPVerified: false,
          rideEndOTPVerifiedAt: null,
          paymentDate: new Date(),
          paymentVerifiedAt: new Date(),
          invoiceNumber,
          invoiceGenerated: true,
          razorpayOrderId,
          razorpayPaymentId,
          remarks: `${booking.remarks || ""}

Payment Verified
Amount : INR ${paidAmount}
Order : ${razorpayOrderId}
Payment : ${razorpayPaymentId}
Verified : ${new Date().toLocaleString("en-IN")}
`,
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedBooking) {
      const latestBooking = await Booking.findById(bookingMongoId).session(
        session
      );

      await session.commitTransaction();
      await session.endSession();
      session = null;

      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        data: latestBooking,
      });
    }

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      {
        vehicleId: booking.vehicleId,
        $or: [
          {
            currentBookingId: "",
          },
          {
            currentBookingId: booking.bookingId,
          },
          {
            currentBookingId: null,
          },
        ],
      },
      {
        $set: {
          vehicleStatus: pendingAmount <= 0 ? "Ready For Pickup" : "Booked",
          currentBookingId: booking.bookingId,
          currentRiderId: booking.riderId,
          assignedRider: booking.riderId,
          lockStatus: "Locked",
        },
      },
      {
        session,
      }
    );

    if (!updatedVehicle) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Vehicle has already been assigned to another booking.",
        },
        { status: 409 }
      );
    }

    await Rider.findOneAndUpdate(
      {
        riderId: booking.riderId,
      },
      {
        $set: {
          activeRide: false,
          currentBookingId: booking.bookingId,
        },
      },
      {
        session,
      }
    );

    await session.commitTransaction();
    await session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message:
        paymentStatus === "Paid"
          ? "Payment verified. Bike is ready for pickup."
          : "Partial payment verified successfully.",
      data: updatedBooking,
      paidAmount,
      pendingAmount,
      paymentStatus,
      pickupOTP: pendingAmount <= 0 ? pickupOTP : undefined,
    });
  } catch (error) {
    if (session) {
      await rollback(session);
      session = null;
    }

    console.error("RAZORPAY VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}
