import { NextResponse } from "next/server";

import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  isUnpaidReserveTimedOut,
  reserveExpiredMessage,
} from "@/lib/bookingReserveTimeout";
import { cancelUnpaidPrePaymentReserve } from "@/lib/cancelUnpaidPrePaymentReserve";
import { isRecentCompletedRide, isUnpaidGhostAfterCompleted } from "@/lib/riderCompletion";
import { openDueRtoInstallment } from "@/lib/rtoInstallmentCycle";
import { generateSixDigitOtp, isOtpExpired, pickupOtpExpiry } from "@/lib/otp";
import {
  hasPickupPaymentMinimum,
  isPickupOtpTestRider,
  pickupPaymentTopUp,
} from "@/lib/pickupPaymentRule";
import { rentalEndAtStart } from "@/lib/rentalSchedule";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

export const runtime = "nodejs";

const BOOKING_PUBLIC_SELECT = "-rideStartOTP";

export async function GET(req: Request) {
  try {
    const firebaseUser = await getVerifiedFirebaseUser(req);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, message: "Sign in required." },
        { status: 401 }
      );
    }

    await connectDB();

    const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
      { firebaseUid: firebaseUser.uid },
    ];
    if (firebaseUser.phone) {
      riderLookups.push({ phone: firebaseUser.phone });
    }

    const rider = await Rider.findOne({
      $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
    });

    if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
      return NextResponse.json({ success: true, data: null, lastCompleted: null });
    }

    const belongs = bookingBelongsToRiderFilter(rider);

    const activeFilter = {
      $and: [
        belongs,
        NOT_DELETED_FILTER,
        { rideStatus: { $nin: ["Cancelled", "Completed"] } },
        { vehicleId: { $exists: true, $nin: ["", null] } },
        {
          $or: [
            { paymentStatus: { $in: ["Pending", "Partial"] } },
            {
              rideStatus: {
                $in: [
                  "Booked",
                  "Reserved",
                  "Payment Pending",
                  "Ready For Pickup",
                  "In Ride",
                ],
              },
            },
          ],
        },
      ],
    };

    const completedDoc = await Booking.findOne({
      $and: [belongs, NOT_DELETED_FILTER, { rideStatus: "Completed" }],
    })
      .select(BOOKING_PUBLIC_SELECT)
      .sort({ completedAt: -1, actualRideEnd: -1, updatedAt: -1 });

    const lastCompleted =
      completedDoc && isRecentCompletedRide(completedDoc.toObject())
        ? completedDoc.toObject()
        : null;

    let reserveExpired = false;

    let activeDoc = await Booking.findOne(activeFilter)
      .select(BOOKING_PUBLIC_SELECT)
      .sort({ createdAt: -1 });

    if (activeDoc && isUnpaidReserveTimedOut(activeDoc.toObject())) {
      await cancelUnpaidPrePaymentReserve(
        String(activeDoc.bookingId),
        "Payment window expired — start a fresh booking"
      );
      reserveExpired = true;
      activeDoc = null;
    }

    if (
      activeDoc &&
      lastCompleted &&
      isUnpaidGhostAfterCompleted(activeDoc.toObject(), lastCompleted)
    ) {
      const ghost = activeDoc;
      ghost.rideStatus = "Cancelled";
      ghost.cancellationReason =
        "Unpaid reserve created after ride-end OTP — cancelled so the completed ride can show thank-you.";
      ghost.cancelledBy = "system";
      await ghost.save();

      await Vehicle.updateOne(
        {
          vehicleId: ghost.vehicleId,
          currentBookingId: ghost.bookingId,
        },
        {
          $set: {
            vehicleStatus: "Available",
            assignedRider: "",
            currentBookingId: "",
            currentRiderId: "",
            lockStatus: "Locked",
          },
        }
      );

      if (String(rider.currentBookingId || "") === String(ghost.bookingId || "")) {
        await Rider.updateOne(
          { _id: rider._id },
          {
            $set: {
              activeRide: false,
              currentBookingId: "",
              currentTripId: "",
            },
          }
        );
      }

      activeDoc = null;
    }

    let booking = activeDoc ? activeDoc.toObject() : null;
    if (activeDoc) {
      await openDueRtoInstallment(activeDoc);
      booking = activeDoc.toObject();
      const pickupPaymentBooking = {
        ...booking,
        userPhone: booking.userPhone || rider.phone,
      };
      const pickupOtpTestMode = isPickupOtpTestRider(pickupPaymentBooking);
      const pickupPaymentMinimumMet = hasPickupPaymentMinimum(pickupPaymentBooking);
      const bookingId = String(booking.bookingId || "").trim().toUpperCase();
      const rideStatus = String(booking.rideStatus || "");
      const otpActive =
        Boolean(String(booking.pickupOTP || "").trim()) &&
        !isOtpExpired(booking.pickupOTPExpiry);
      const riderHasOtherActiveBooking =
        Boolean(rider.activeRide) &&
        String(rider.currentBookingId || "").trim().toUpperCase() !== bookingId;

      if (
        pickupPaymentMinimumMet &&
        !riderHasOtherActiveBooking &&
        !booking.pickupOTPVerified &&
        !["In Ride", "Completed", "Cancelled"].includes(rideStatus)
      ) {
        const vehicleClaim = await Vehicle.updateOne(
          {
            vehicleId: booking.vehicleId,
            vehicleStatus: { $nin: ["In Ride", "Maintenance", "Unavailable"] },
            $or: [
              { currentBookingId: "" },
              { currentBookingId: booking.bookingId },
              { currentBookingId: null },
              { currentBookingId: { $exists: false } },
            ],
          },
          {
            $set: {
              vehicleStatus: "Ready For Pickup",
              lockStatus: "Locked",
              assignedRider: rider.riderId,
              currentBookingId: booking.bookingId,
              currentRiderId: rider.riderId,
            },
          }
        );

        if (vehicleClaim.matchedCount > 0) {
          if (String(activeDoc.rideStatus || "") !== "Ready For Pickup" || !otpActive) {
            activeDoc.rideStatus = "Ready For Pickup";
            if (!otpActive) {
              activeDoc.pickupOTP = generateSixDigitOtp();
              activeDoc.pickupOTPExpiry = pickupOtpExpiry();
              activeDoc.pickupOTPVerified = false;
              activeDoc.pickupOTPVerifiedAt = null;
            }
            if (!activeDoc.userPhone && rider.phone) activeDoc.userPhone = rider.phone;
            await activeDoc.save();
          }
          await Rider.updateOne(
            {
              _id: rider._id,
              $or: [
                { currentBookingId: "" },
                { currentBookingId: booking.bookingId },
                { currentBookingId: null },
                { currentBookingId: { $exists: false } },
              ],
            },
            {
              $set: {
                activeRide: false,
                currentBookingId: booking.bookingId,
              },
            }
          );
          booking = activeDoc.toObject();
        }
      }
      booking.pickupOtpTestMode = pickupOtpTestMode;
      booking.pickupPaymentMinimumMet = pickupPaymentMinimumMet;
      booking.pickupPaymentTopUp = pickupPaymentTopUp(pickupPaymentBooking);
    }
    if (
      booking?.rideStatus === "In Ride" &&
      booking.actualRideStart &&
      booking.rentalMode !== "Rent To Own"
    ) {
      const actualEnd = rentalEndAtStart(
        new Date(booking.actualRideStart),
        String(booking.rentalMode || ""),
        Number(booking.rentalHours || 1),
        Number(booking.rentToOwnMonths || 20)
      );
      booking.rentalEndDate = actualEnd;
      booking.expectedReturnDate = actualEnd;
    }

    return NextResponse.json({
      success: true,
      data: booking || null,
      lastCompleted,
      reserveExpired,
      reserveExpiredMessage: reserveExpired ? reserveExpiredMessage() : undefined,
    });
  } catch (error) {
    console.error("BOOKING MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your booking." },
      { status: 500 }
    );
  }
}
