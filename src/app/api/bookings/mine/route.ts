import { NextResponse } from "next/server";

import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { isRecentCompletedRide, isUnpaidGhostAfterCompleted } from "@/lib/riderCompletion";
import { openDueRtoInstallment } from "@/lib/rtoInstallmentCycle";
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

    let activeDoc = await Booking.findOne(activeFilter)
      .select(BOOKING_PUBLIC_SELECT)
      .sort({ createdAt: -1 });

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
    }

    return NextResponse.json({
      success: true,
      data: booking || null,
      lastCompleted,
    });
  } catch (error) {
    console.error("BOOKING MINE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load your booking." },
      { status: 500 }
    );
  }
}
