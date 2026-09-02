import {
  denyStaffDeletes,
  isAdminAuthenticated,
  requireAdminDashboards,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";

import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import Refund from "@/models/Refund";
import { getBookingPayableAmount } from "@/lib/gst";
import {
  hubForbiddenResponse,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";

const allowedPaymentModes = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
  "Razorpay",
];

const allowedPaymentStatuses = [
  "Pending",
  "Partial",
  "Paid",
];

const allowedRideStatuses = [
  "Booked",
  "Reserved",
  "Payment Pending",
  "Ready For Pickup",
  "Cancelled",
];

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function bookingLookupFilter(id: string) {
  const cleanedId = clean(id);
  const filters: Record<string, unknown>[] = [
    {
      bookingId: cleanedId.toUpperCase(),
      isDeleted: false,
    },
  ];

  if (mongoose.Types.ObjectId.isValid(cleanedId)) {
    filters.push({
      _id: cleanedId,
      isDeleted: false,
    });
  }

  return {
    $or: filters,
  };
}

function isValidNonNegativeAmount(value: unknown): boolean {
  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0;
}

function generateTransactionId(prefix = "WTX"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeAmount(value: unknown): number {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Number(amount.toFixed(2));
}

function isAllowedRideTransition(
  currentStatus: string,
  requestedStatus: string
): boolean {
  if (currentStatus === requestedStatus) {
    return true;
  }

  const transitions: Record<string, string[]> = {
    Booked: [
      "Reserved",
      "Payment Pending",
      "Ready For Pickup",
      "Cancelled",
    ],

    Reserved: [
      "Booked",
      "Payment Pending",
      "Ready For Pickup",
      "Cancelled",
    ],

    "Payment Pending": [
      "Booked",
      "Reserved",
      "Ready For Pickup",
      "Cancelled",
    ],

    "Ready For Pickup": [
      "Cancelled",
    ],

    Cancelled: [],
  };

  return transitions[currentStatus]?.includes(requestedStatus) ?? false;
}

/* -------------------------------------------------------------------------- */
/* PATCH BOOKING                                                              */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
    if (gate.error) return gate.error;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne(
      bookingLookupFilter(id)
    ).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    if (!staffCanAccessBooking(gate.session, booking)) {
      await session.abortTransaction();
      session.endSession();
      session = null;
      return hubForbiddenResponse();
    }

    if (booking.rideStatus === "Completed") {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Completed booking cannot be modified.",
        },
        { status: 400 }
      );
    }

    if (booking.rideStatus === "In Ride") {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Active ride cannot be modified.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* INPUTS                                                                  */
    /* ---------------------------------------------------------------------- */

    const rentalEndDate = body.rentalEndDate;
    const endHub = body.endHub;
    const receivedAmount = body.receivedAmount;
    const paymentMode = body.paymentMode;
    const paymentStatus = body.paymentStatus;
    const rideStatus = body.rideStatus;
    const remarks = body.remarks;

    /* ---------------------------------------------------------------------- */
    /* VALIDATE PAYMENT MODE                                                   */
    /* ---------------------------------------------------------------------- */

    if (
      paymentMode !== undefined &&
      !allowedPaymentModes.includes(clean(paymentMode))
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment mode.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE PAYMENT STATUS                                                 */
    /* ---------------------------------------------------------------------- */

    if (
      paymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(clean(paymentStatus))
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment status.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE RIDE STATUS                                                    */
    /* ---------------------------------------------------------------------- */

    if (
      rideStatus !== undefined &&
      !allowedRideStatuses.includes(clean(rideStatus))
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid ride status.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE RECEIVED AMOUNT                                                */
    /* ---------------------------------------------------------------------- */

    if (
      receivedAmount !== undefined &&
      !isValidNonNegativeAmount(receivedAmount)
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid received amount.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE REMARKS                                                        */
    /* ---------------------------------------------------------------------- */

    if (
      remarks !== undefined &&
      clean(remarks).length > 500
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Remarks cannot exceed 500 characters.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE RENTAL END DATE                                                */
    /* ---------------------------------------------------------------------- */

    if (rentalEndDate !== undefined) {
      const parsedEndDate = new Date(rentalEndDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        await session.abortTransaction();
        session.endSession();
        session = null;

        return NextResponse.json(
          {
            success: false,
            message: "Invalid rental end date.",
          },
          { status: 400 }
        );
      }

      if (
        booking.rentalStartDate &&
        parsedEndDate < new Date(booking.rentalStartDate)
      ) {
        await session.abortTransaction();
        session.endSession();
        session = null;

        return NextResponse.json(
          {
            success: false,
            message:
              "Rental end date cannot be before rental start date.",
          },
          { status: 400 }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* VALIDATE END HUB                                                        */
    /* ---------------------------------------------------------------------- */

    if (
      endHub !== undefined &&
      clean(endHub).length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "End Hub is invalid.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CALCULATE PAYMENT VALUES                                                */
    /* ---------------------------------------------------------------------- */

    const payableAmount = normalizeAmount(
      getBookingPayableAmount(booking)
    );

    let finalReceivedAmount = normalizeAmount(
      booking.receivedAmount || 0
    );

    if (receivedAmount !== undefined) {
      finalReceivedAmount = normalizeAmount(receivedAmount);
    }

    if (finalReceivedAmount > payableAmount) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: `Received amount cannot exceed payable amount of ₹${payableAmount}.`,
        },
        { status: 400 }
      );
    }

    const finalPendingAmount = Number(
      Math.max(
        0,
        payableAmount - finalReceivedAmount
      ).toFixed(2)
    );

    /* ---------------------------------------------------------------------- */
    /* DETERMINE PAYMENT STATUS                                                */
    /* ---------------------------------------------------------------------- */

    let finalPaymentStatus =
      paymentStatus !== undefined
        ? clean(paymentStatus)
        : booking.paymentStatus;

    if (receivedAmount !== undefined) {
      if (finalReceivedAmount === 0) {
        finalPaymentStatus = "Pending";
      } else if (finalReceivedAmount < payableAmount) {
        finalPaymentStatus = "Partial";
      } else {
        finalPaymentStatus = "Paid";
      }
    }

    if (
      finalPaymentStatus === "Paid" &&
      finalReceivedAmount < payableAmount
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment status cannot be Paid until the full payable amount is received.",
        },
        { status: 400 }
      );
    }

    if (
      finalPaymentStatus === "Partial" &&
      (
        finalReceivedAmount <= 0 ||
        finalReceivedAmount >= payableAmount
      )
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Partial payment requires an amount greater than zero and less than the full payable amount.",
        },
        { status: 400 }
      );
    }

    if (
      finalPaymentStatus === "Pending" &&
      finalReceivedAmount !== 0
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Pending payment status requires received amount to be zero.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* DETERMINE RIDE STATUS                                                   */
    /* ---------------------------------------------------------------------- */

    const requestedRideStatus =
      rideStatus !== undefined
        ? clean(rideStatus)
        : booking.rideStatus;

    if (
      rideStatus !== undefined &&
      !isAllowedRideTransition(
        booking.rideStatus,
        requestedRideStatus
      )
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            `Invalid ride status transition: ${booking.rideStatus} → ${requestedRideStatus}.`,
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* PAYMENT / READY-FOR-PICKUP RULE                                        */
    /* ---------------------------------------------------------------------- */

    if (
      requestedRideStatus === "Ready For Pickup" &&
      Number(booking.receivedAmount || finalReceivedAmount || 0) < 1
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Booking cannot be marked Ready For Pickup until a payment is received.",
        },
        { status: 409 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CANCELLATION                                                           */
    /* ---------------------------------------------------------------------- */

    const isCancelling =
      requestedRideStatus === "Cancelled" &&
      booking.rideStatus !== "Cancelled";

    /* ---------------------------------------------------------------------- */
    /* FETCH VEHICLE AND RIDER                                                 */
    /* ---------------------------------------------------------------------- */

    const vehicle = await Vehicle.findOne({
      vehicleId: booking.vehicleId,
    }).session(session);

    if (!vehicle) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Vehicle not found.",
        },
        { status: 404 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
    }).session(session);

    if (!rider) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VEHICLE BOOKING OWNERSHIP CHECK                                        */
    /* ---------------------------------------------------------------------- */

    if (
      vehicle.currentBookingId &&
      vehicle.currentBookingId !== booking.bookingId
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Vehicle booking mismatch.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* RIDER BOOKING OWNERSHIP CHECK                                          */
    /* ---------------------------------------------------------------------- */

    if (
      rider.currentBookingId &&
      rider.currentBookingId !== booking.bookingId
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Rider booking mismatch.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* APPLY NORMAL BOOKING UPDATES                                            */
    /* ---------------------------------------------------------------------- */

    if (rentalEndDate !== undefined) {
      booking.rentalEndDate = new Date(rentalEndDate);
    }

    if (endHub !== undefined) {
      booking.endHub = clean(endHub);
    }

    if (remarks !== undefined) {
      booking.remarks = clean(remarks);
    }

    if (paymentMode !== undefined) {
      booking.paymentMode = clean(paymentMode);
    }

    booking.receivedAmount = finalReceivedAmount;
    booking.pendingAmount = finalPendingAmount;
    booking.paymentStatus = finalPaymentStatus;

    if (finalPaymentStatus === "Paid") {
      booking.paymentDate =
        booking.paymentDate || new Date();

      booking.paymentVerifiedAt =
        booking.paymentVerifiedAt || new Date();
    }

    /* ---------------------------------------------------------------------- */
    /* HANDLE CANCELLATION                                                    */
    /* ---------------------------------------------------------------------- */

    if (isCancelling) {
      /* -------------------------------------------------------------------- */
      /* RELEASE VEHICLE                                                      */
      /* -------------------------------------------------------------------- */

      const nextVehicleStatus =
        Number(vehicle.batteryPercentage || 0) < 20
          ? "Low Battery"
          : "Available";

      await Vehicle.updateOne(
        {
          vehicleId: booking.vehicleId,
        },
        {
          $set: {
            vehicleStatus: nextVehicleStatus,
            assignedRider: "",
            currentBookingId: "",
            currentRiderId: "",
            lockStatus: "Locked",
          },
          $inc: {
            version: 1,
          },
        },
        {
          session,
        }
      );

      /* -------------------------------------------------------------------- */
      /* RELEASE RIDER                                                        */
      /* -------------------------------------------------------------------- */

      await Rider.updateOne(
        {
          riderId: booking.riderId,
        },
        {
          $set: {
            activeRide: false,
            currentBookingId: "",
            currentTripId: "",
            lastRideCompletedAt: new Date(),
            updatedBy: "Admin",
          },
          $inc: {
            version: 1,
          },
        },
        {
          session,
        }
      );

      /* -------------------------------------------------------------------- */
      /* RELEASE SECURITY DEPOSIT HOLD (hold only — not a cash refund)        */
      /* -------------------------------------------------------------------- */

      const existingHold = await WalletTransaction.findOne({
        bookingId: booking.bookingId,
        transactionType: "Security Deposit Hold",
      }).session(session);

      const wallet = await Wallet.findOne({
        riderId: booking.riderId,
        isDeleted: false,
      }).session(session);

      if (
        existingHold &&
        wallet &&
        Number(booking.securityDeposit || 0) > 0
      ) {
        wallet.securityDepositHold = Math.max(
          0,
          Number(wallet.securityDepositHold || 0) -
            Number(booking.securityDeposit || 0)
        );

        wallet.updatedBy = "Admin";
        wallet.version += 1;

        await wallet.save({
          session,
        });
      }

      /* -------------------------------------------------------------------- */
      /* CREATE SECURITY DEPOSIT RELEASE TRANSACTION                          */
      /* -------------------------------------------------------------------- */

      const existingRelease =
        await WalletTransaction.findOne({
          bookingId: booking.bookingId,
          transactionType: "Security Deposit Release",
        }).session(session);

      if (
        existingHold &&
        !existingRelease &&
        Number(booking.securityDeposit || 0) > 0
      ) {
        await WalletTransaction.create(
          [
            {
              transactionId:
                generateTransactionId(),

              riderId: booking.riderId,

              userId: booking.userId,

              userName: booking.userName,

              bookingId: booking.bookingId,

              amount: Number(
                booking.securityDeposit || 0
              ),

              paymentMethod: "Wallet",

              transactionType:
                "Security Deposit Release",

              balanceAfter: wallet
                ? wallet.balance
                : 0,

              remarks:
                "Security deposit hold released after booking cancellation.",

              status: "Success",
            },
          ],
          {
            session,
          }
        );
      }

      /* Deposit cash refund is queued only after a fully paid completed ride. */

      /* -------------------------------------------------------------------- */
      /* CANCEL BOOKING                                                       */
      /* -------------------------------------------------------------------- */

      booking.rideStatus = "Cancelled";

      booking.cancelledBy = "Admin";

      booking.cancellationReason =
        clean(remarks) ||
        "Cancelled by admin";

      booking.refundAmount = 0;

      booking.securityDepositRefunded = false;

      /* -------------------------------------------------------------------- */
      /* CLEAR OTP / RIDE STATE                                               */
      /* -------------------------------------------------------------------- */

      booking.pickupOTP = "";
      booking.pickupOTPExpiry = null;

      booking.rideStartOTP = "";
      booking.rideStartOTPExpiry = null;

      booking.rideEndOTP = "";
      booking.rideEndOTPExpiry = null;

      booking.pickupOTPVerified = false;
      booking.rideStartOTPVerified = false;
      booking.rideEndOTPVerified = false;

      booking.pickupOTPVerifiedAt = undefined;
      booking.rideEndOTPVerifiedAt = undefined;

      booking.actualRideStart = undefined;
      booking.actualRideEnd = undefined;
      booking.completedAt = undefined;
    } else if (rideStatus !== undefined) {
      booking.rideStatus = requestedRideStatus;

      const vehiclePatch: Record<string, unknown> = {};
      if (requestedRideStatus === "Ready For Pickup") {
        vehiclePatch.vehicleStatus = "Ready For Pickup";
        vehiclePatch.currentBookingId = booking.bookingId;
        vehiclePatch.assignedRider = booking.riderId;
      } else if (requestedRideStatus === "In Ride") {
        vehiclePatch.vehicleStatus = "In Ride";
        vehiclePatch.currentBookingId = booking.bookingId;
      } else if (requestedRideStatus === "Completed") {
        vehiclePatch.vehicleStatus =
          Number(vehicle.batteryPercentage || 0) < 20 ? "Low Battery" : "Available";
        vehiclePatch.currentBookingId = "";
        vehiclePatch.assignedRider = "";
        vehiclePatch.currentRiderId = "";
        vehiclePatch.lockStatus = "Locked";
      } else if (
        requestedRideStatus === "Booked" ||
        requestedRideStatus === "Payment Pending"
      ) {
        vehiclePatch.vehicleStatus = "Booked";
        vehiclePatch.currentBookingId = booking.bookingId;
      }

      if (Object.keys(vehiclePatch).length > 0) {
        await Vehicle.updateOne(
          { vehicleId: booking.vehicleId },
          { $set: vehiclePatch },
          { session }
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* VERSION / AUDIT                                                        */
    /* ---------------------------------------------------------------------- */

    booking.updatedBy = "Admin";
    booking.version += 1;

    await booking.save({
      session,
    });

    /* ---------------------------------------------------------------------- */
    /* COMMIT                                                                 */
    /* ---------------------------------------------------------------------- */

    await session.commitTransaction();
    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,

      message: isCancelling
        ? "Booking cancelled successfully."
        : "Booking updated successfully.",

      data: booking,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error("UPDATE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update booking.",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE BOOKING                                                             */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    const blockedDelete = await denyStaffDeletes();
    if (blockedDelete) return blockedDelete;


    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne(
      bookingLookupFilter(id)
    ).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* NEVER DELETE ACTIVE/FINANCIAL BOOKINGS                                 */
    /* ---------------------------------------------------------------------- */

    if (
      booking.rideStatus === "Ready For Pickup" ||
      booking.rideStatus === "In Ride" ||
      booking.rideStatus === "Completed"
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "This booking cannot be deleted while active or completed.",
        },
        { status: 400 }
      );
    }

    if (
      booking.paymentStatus === "Paid" ||
      Number(booking.receivedAmount || 0) > 0
    ) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Paid or partially paid bookings cannot be deleted.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* DO NOT DELETE BOOKINGS WITH REFUND RECORDS                             */
    /* ---------------------------------------------------------------------- */

    const refund = await Refund.findOne({
      bookingId: booking.bookingId,
      refundStatus: {
        $ne: "REJECTED",
      },
    }).session(session);

    if (refund) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Booking cannot be deleted because a refund record exists.",
        },
        { status: 400 }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* RELEASE VEHICLE                                                        */
    /* ---------------------------------------------------------------------- */

    const vehicle = await Vehicle.findOne({
      vehicleId: booking.vehicleId,
    }).session(session);

    if (
      vehicle &&
      vehicle.currentBookingId === booking.bookingId
    ) {
      const nextVehicleStatus =
        Number(vehicle.batteryPercentage || 0) < 20
          ? "Low Battery"
          : "Available";

      await Vehicle.updateOne(
        {
          vehicleId: booking.vehicleId,
        },
        {
          $set: {
            currentBookingId: "",
            assignedRider: "",
            currentRiderId: "",
            lockStatus: "Locked",
            vehicleStatus: nextVehicleStatus,
          },
          $inc: {
            version: 1,
          },
        },
        {
          session,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* RELEASE RIDER                                                          */
    /* ---------------------------------------------------------------------- */

    await Rider.updateOne(
      {
        riderId: booking.riderId,
        currentBookingId: booking.bookingId,
      },
      {
        $set: {
          activeRide: false,
          currentBookingId: "",
          currentTripId: "",
          updatedBy: "Admin",
        },
        $inc: {
          version: 1,
        },
      },
      {
        session,
      }
    );

    const wallet = await Wallet.findOne({
      riderId: booking.riderId,
      isDeleted: false,
    }).session(session);

    const existingHold = await WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Hold",
    }).session(session);

    const existingRelease = await WalletTransaction.findOne({
      bookingId: booking.bookingId,
      transactionType: "Security Deposit Release",
    }).session(session);

    if (
      wallet &&
      existingHold &&
      !existingRelease &&
      Number(booking.securityDeposit || 0) > 0
    ) {
      wallet.securityDepositHold = Math.max(
        0,
        Number(wallet.securityDepositHold || 0) -
          Number(booking.securityDeposit || 0)
      );
      wallet.updatedBy = "Admin";
      wallet.version += 1;

      await wallet.save({
        session,
      });

      await WalletTransaction.create(
        [
          {
            transactionId: generateTransactionId(),
            riderId: booking.riderId,
            userId: booking.userId,
            userName: booking.userName,
            bookingId: booking.bookingId,
            amount: Number(booking.securityDeposit || 0),
            paymentMethod: "Wallet",
            transactionType: "Security Deposit Release",
            balanceAfter: wallet.balance,
            remarks:
              "Security deposit hold released after unpaid booking deletion.",
            status: "Success",
          },
        ],
        {
          session,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* SOFT DELETE                                                            */
    /* ---------------------------------------------------------------------- */

    booking.isDeleted = true;
    booking.deletedAt = new Date();
    booking.updatedBy = "Admin";
    booking.version += 1;

    await booking.save({
      session,
    });

    await session.commitTransaction();
    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error("DELETE BOOKING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete booking.",
        error:
          process.env.NODE_ENV === "development"
            ? String(error)
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}
