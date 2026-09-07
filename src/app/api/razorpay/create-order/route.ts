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
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import {
  getBookingPayableAmount,
} from "@/lib/gst";
import { openDueRtoInstallment } from "@/lib/rtoInstallmentCycle";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { maybeSweepUnpaidBookings } from "@/lib/jobs/releaseUnpaidBookings";
import { applyWalletBookingPayment } from "@/lib/applyWalletBookingPayment";
import { applyCapturedRazorpayPayment } from "@/lib/razorpay/applyCapturedPayment";

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
    const body = await req.json();
    if (!(await rateLimitAllowed(`razorpay-order:${clientIp(req)}`, 60, 10 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, message: "Too many payment attempts. Please wait." },
        { status: 429 }
      );
    }
    const bookingMongoId = clean(body.bookingMongoId);
    const requestedAmount = parseAmount(body.amount);
    const wantsWallet =
      body.useWallet === true ||
      clean(body.paymentMethod).toLowerCase() === "wallet";

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
    void maybeSweepUnpaidBookings();

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

    const isAdminRequest = await isAdminAuthenticated().catch(() => false);
    if (isAdminRequest) {
      const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
      if (gate.error) return gate.error;
    }

    if (!isAdminRequest) {
      const firebaseUser = await getVerifiedFirebaseUser(
        req,
        body.firebaseIdToken
      );

      if (
        !firebaseUserOwnsRider(firebaseUser, {
          firebaseUid: rider.firebaseUid,
          phone: rider.phone,
          userPhone: booking.userPhone,
        })
      ) {
        return riderPayUnauthorizedResponse();
      }

      if (firebaseUser?.uid && !rider.firebaseUid) {
        rider.firebaseUid = firebaseUser.uid;
        await rider.save();
      }
    }

    if (
      !isAdminRequest &&
      !(await rateLimitAllowed(`razorpay-order-rider:${rider.riderId}`, 30, 10 * 60 * 1000))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many payment attempts. Please wait.",
        },
        { status: 429 }
      );
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
      booking.rideStatus === "Cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment cannot be made for this booking.",
        },
        { status: 400 }
      );
    }

    await openDueRtoInstallment(booking);

    const payableAmount = getBookingPayableAmount(booking);

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

    if (
      booking.rentalMode === "Rent To Own" &&
      Number(amount.toFixed(2)) !== Number(remainingAmount.toFixed(2))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rent to Own requires today’s full amount (₹280 + 5% GST) in one payment.",
        },
        { status: 400 }
      );
    }

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

    if (wantsWallet) {
      const walletResult = await applyWalletBookingPayment({
        bookingMongoId,
        paidAmount: amount,
      });

      if (!walletResult.ok) {
        return NextResponse.json(
          { success: false, message: walletResult.message },
          { status: walletResult.status }
        );
      }

      const walletBooking = (walletResult.booking || {}) as {
        receivedAmount?: number;
        paymentDue?: number;
      };

      return NextResponse.json({
        success: true,
        paidWithWallet: true,
        payableAmount,
        remainingAmount: walletResult.pendingAmount,
        pendingAmount: walletResult.pendingAmount,
        receivedAmount: Number(walletBooking.receivedAmount || 0),
        paymentDue: Number(walletBooking.paymentDue || payableAmount),
        paymentStatus: walletResult.paymentStatus,
        pickupOTP: walletResult.pickupOTP,
        rideEndOTP: walletResult.ok ? walletResult.rideEndOTP : undefined,
        booking: walletResult.booking,
        data: walletResult.booking,
        message: walletResult.message,
      });
    }

    const loaded = getRazorpayConfig();
    if (!loaded.ok) {
      return NextResponse.json(
        { success: false, message: loaded.message },
        { status: 500 }
      );
    }
    const { keyId, checkoutImage, isLive } = loaded.config;

    const razorpay = getRazorpayClient();

    const amountPaise = Math.round(amount * 100);
    const existingOrderId = clean(booking.razorpayOrderId);
    if (existingOrderId) {
      try {
        const existing = (await razorpay.orders.fetch(existingOrderId)) as {
          id?: string;
          status?: string;
          amount?: number;
          currency?: string;
        };
        const payments = (await razorpay.orders.fetchPayments(existingOrderId)) as {
          items?: Array<{ id?: string; status?: string; amount?: number }>;
        };
        const captured = (payments.items || []).find((item) => item.status === "captured");
        if (captured?.id) {
          const paidAmount = Number(captured.amount || existing.amount || amountPaise) / 100;
          const applied = await applyCapturedRazorpayPayment({
            bookingMongoId,
            razorpayOrderId: existingOrderId,
            razorpayPaymentId: String(captured.id),
            paidAmount,
          });
          if (!applied.ok) {
            return NextResponse.json(
              { success: false, message: applied.message },
              { status: applied.status }
            );
          }
          const walletBooking = (applied.booking || {}) as {
            receivedAmount?: number;
            paymentDue?: number;
          };
          return NextResponse.json({
            success: true,
            alreadyCaptured: true,
            payableAmount,
            remainingAmount: applied.pendingAmount,
            pendingAmount: applied.pendingAmount,
            receivedAmount: Number(walletBooking.receivedAmount || 0),
            paymentDue: Number(walletBooking.paymentDue || payableAmount),
            paymentStatus: applied.paymentStatus,
            pickupOTP: applied.pickupOTP,
            rideEndOTP: applied.rideEndOTP,
            booking: applied.booking,
            data: applied.booking,
            message: applied.message,
          });
        }
        const status = String(existing.status || "");
        if (
          (status === "created" || status === "attempted") &&
          Number(existing.amount || 0) === amountPaise
        ) {
          return NextResponse.json({
            success: true,
            keyId,
            live: isLive,
            image: checkoutImage,
            name: "EVUDDY",
            orderId: existing.id || existingOrderId,
            amount: existing.amount,
            currency: existing.currency || "INR",
            payableAmount,
            remainingAmount,
          });
        }
      } catch (existingOrderError) {
        console.error("RAZORPAY EXISTING ORDER LOOKUP:", existingOrderError);
      }
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      payment_capture: true,
      receipt: String(`booking_${booking.bookingId}_${Date.now()}`).slice(
        0,
        40
      ),
      notes: {
        bookingMongoId,
        bookingId: booking.bookingId,
        vehicleId: booking.vehicleId || "",
        riderPhone: rider.phone || "",
        payableAmount: String(payableAmount),
        remainingAmount: String(remainingAmount),
      },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return NextResponse.json({
      success: true,
      keyId,
      live: isLive,
      image: checkoutImage,
      name: "EVUDDY",
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
