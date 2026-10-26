import type { ClientSession } from "mongoose";

import {
  abortOptionalTransaction,
  commitOptionalTransaction,
  sessionOpts,
  startOptionalTransaction,
} from "@/lib/mongoTransaction";
import { isUnpaidPrePaymentReserve } from "@/lib/unpaidPrePaymentReserve";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

const HELD_PRE_RIDE = ["Booked", "Reserved", "Payment Pending", "Ready For Pickup"];

export async function cancelUnpaidPrePaymentReserve(
  bookingId: string,
  reason = "Rider started a new booking without paying for the reserve",
  updatedBy = "Rider"
) {
  const session = await startOptionalTransaction();

  try {
    const bookingQuery = Booking.findOne({
      bookingId,
      rideStatus: { $in: HELD_PRE_RIDE },
      pickupOTPVerified: { $ne: true },
      paymentStatus: "Pending",
      receivedAmount: { $lte: 0 },
    });
    const booking = session ? await bookingQuery.session(session) : await bookingQuery;

    if (!booking || !isUnpaidPrePaymentReserve(booking.toObject())) {
      await abortOptionalTransaction(session);
      return { cancelled: false as const };
    }

    const vehicle = await (session
      ? Vehicle.findOne({ vehicleId: booking.vehicleId }).session(session)
      : Vehicle.findOne({ vehicleId: booking.vehicleId }));

    if (vehicle && vehicle.currentBookingId === booking.bookingId) {
      await Vehicle.updateOne(
        { vehicleId: booking.vehicleId },
        {
          $set: {
            vehicleStatus:
              Number(vehicle.batteryPercentage || 0) < 20 ? "Low Battery" : "Available",
            assignedRider: "",
            currentBookingId: "",
            currentRiderId: "",
            lockStatus: "Locked",
          },
        },
        sessionOpts(session)
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
          updatedBy,
        },
      },
      sessionOpts(session)
    );

    booking.rideStatus = "Cancelled";
    booking.cancelledBy = updatedBy === "Rider" ? "Rider" : "System";
    booking.cancellationReason = reason;
    booking.pickupOTP = "";
    booking.pickupOTPExpiry = null;
    booking.updatedBy = updatedBy;
    await booking.save(sessionOpts(session));

    await commitOptionalTransaction(session);
    return { cancelled: true as const, bookingId: booking.bookingId };
  } catch (error) {
    await abortOptionalTransaction(session);
    throw error;
  }
}

export async function cancelUnpaidPrePaymentReserveInSession(
  booking: InstanceType<typeof Booking>,
  session: ClientSession | null,
  reason: string,
  updatedBy: string
) {
  if (!isUnpaidPrePaymentReserve(booking.toObject())) {
    return false;
  }

  const vehicle = session
    ? await Vehicle.findOne({ vehicleId: booking.vehicleId }).session(session)
    : await Vehicle.findOne({ vehicleId: booking.vehicleId });

  if (vehicle && vehicle.currentBookingId === booking.bookingId) {
    await Vehicle.updateOne(
      { vehicleId: booking.vehicleId },
      {
        $set: {
          vehicleStatus:
            Number(vehicle.batteryPercentage || 0) < 20 ? "Low Battery" : "Available",
          assignedRider: "",
          currentBookingId: "",
          currentRiderId: "",
          lockStatus: "Locked",
        },
      },
      sessionOpts(session)
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
        updatedBy,
      },
    },
    sessionOpts(session)
  );

  booking.rideStatus = "Cancelled";
  booking.cancelledBy = updatedBy === "Rider" ? "Rider" : "System";
  booking.cancellationReason = reason;
  booking.pickupOTP = "";
  booking.pickupOTPExpiry = null;
  booking.updatedBy = updatedBy;
  await booking.save(sessionOpts(session));
  return true;
}
