import mongoose from "mongoose";

import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

const UNPAID_TTL_MS = 30 * 60 * 1000;

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

export async function releaseUnpaidBookings(limit = 50) {
  const cutoff = new Date(Date.now() - UNPAID_TTL_MS);

  const stale = await Booking.find({
    ...NOT_DELETED,
    paymentStatus: "Pending",
    receivedAmount: { $lte: 0 },
    rideStatus: { $in: ["Booked", "Reserved", "Payment Pending"] },
    createdAt: { $lte: cutoff },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .select("bookingId riderId vehicleId")
    .lean();

  let released = 0;

  for (const row of stale) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await Booking.findOne({
        bookingId: row.bookingId,
        paymentStatus: "Pending",
        receivedAmount: { $lte: 0 },
        rideStatus: { $in: ["Booked", "Reserved", "Payment Pending"] },
        ...NOT_DELETED,
      }).session(session);

      if (!booking) {
        await session.abortTransaction();
        session.endSession();
        continue;
      }

      const vehicle = await Vehicle.findOne({
        vehicleId: booking.vehicleId,
      }).session(session);

      if (vehicle && vehicle.currentBookingId === booking.bookingId) {
        await Vehicle.updateOne(
          { vehicleId: booking.vehicleId },
          {
            $set: {
              vehicleStatus:
                Number(vehicle.batteryPercentage || 0) < 20
                  ? "Low Battery"
                  : "Available",
              assignedRider: "",
              currentBookingId: "",
              currentRiderId: "",
              lockStatus: "Locked",
            },
          },
          { session }
        );
      }

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
            updatedBy: "System",
          },
        },
        { session }
      );

      booking.rideStatus = "Cancelled";
      booking.cancelledBy = "System";
      booking.cancellationReason = "Unpaid reservation expired";
      booking.pickupOTP = "";
      booking.pickupOTPExpiry = null;
      booking.updatedBy = "System";
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();
      released += 1;
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch {}
      session.endSession();
      console.error("RELEASE UNPAID BOOKING ERROR:", row.bookingId, error);
    }
  }

  return { scanned: stale.length, released };
}

let lastSweep = 0;

export async function maybeSweepUnpaidBookings() {
  const now = Date.now();
  if (now - lastSweep < 30 * 1000) return null;
  lastSweep = now;
  try {
    return await releaseUnpaidBookings(100);
  } catch (error) {
    console.error("UNPAID BOOKING SWEEP ERROR:", error);
    return null;
  }
}
