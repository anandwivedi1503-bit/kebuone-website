import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getOwnedActiveBooking } from "@/lib/ownedActiveBooking";
import { writeAudit } from "@/lib/writeAudit";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();
    const owned = await getOwnedActiveBooking(req);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, message: owned.message },
        { status: owned.status }
      );
    }

    const { booking, rider } = owned;

    if (booking.rideStatus === "In Ride" && booking.actualRideStart) {
      return NextResponse.json({
        success: true,
        alreadyStarted: true,
        message: "Ride is already in progress.",
        rideStatus: booking.rideStatus,
        data: booking,
      });
    }

    if (!booking.pickupOTPVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "The yard must enter your pickup OTP before you can start the ride.",
        },
        { status: 400 }
      );
    }

    if (booking.rideStatus !== "Ready For Pickup") {
      return NextResponse.json(
        {
          success: false,
          message: "Booking is not ready for the rider to start.",
        },
        { status: 400 }
      );
    }

    if (Number(booking.receivedAmount || 0) < 1) {
      return NextResponse.json(
        { success: false, message: "Pay at least ₹1 before starting." },
        { status: 400 }
      );
    }

    booking.rideStatus = "In Ride";
    booking.actualRideStart = booking.actualRideStart || new Date();
    await booking.save();

    await Vehicle.updateOne(
      { vehicleId: booking.vehicleId },
      {
        $set: {
          vehicleStatus: "In Ride",
          lockStatus: "Unlocked",
          assignedRider: booking.riderId,
          currentBookingId: booking.bookingId,
          currentRiderId: booking.riderId,
          rideStartedAt: new Date(),
        },
      }
    );

    await Rider.updateOne(
      { riderId: rider.riderId },
      {
        $set: {
          activeRide: true,
          currentBookingId: booking.bookingId,
        },
      }
    );

    void writeAudit({
      actor: "Rider",
      action: "RIDER_SWIPE_START",
      entity: "Booking",
      entityId: booking.bookingId,
      riderId: rider.riderId,
      bookingId: booking.bookingId,
      detail: "Rider swiped Ride started after yard pickup OTP.",
    });

    return NextResponse.json({
      success: true,
      message: "Ride started. Enjoy the ride. Pay any remaining amount before you return.",
      rideStatus: booking.rideStatus,
      actualRideStart: booking.actualRideStart,
      data: booking,
    });
  } catch (error) {
    console.error("RIDER START RIDE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to start the ride." },
      { status: 500 }
    );
  }
}
