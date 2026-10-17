import { recordJobHeartbeat } from "@/lib/jobHeartbeat";
import {
  abortOptionalTransaction,
  commitOptionalTransaction,
  isMongoTransactionUnsupported,
  sessionOpts,
  startOptionalTransaction,
} from "@/lib/mongoTransaction";
import { openDueRtoInstallment } from "@/lib/rtoInstallmentCycle";
import { queueCancellationRefundIfPaid } from "@/lib/queueCancellationRefund";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

const UNPAID_TTL_MS = 30 * 60 * 1000;
const ABANDONED_PARTIAL_TTL_MS = 24 * 60 * 60 * 1000;
const HELD_PRE_RIDE = ["Booked", "Reserved", "Payment Pending", "Ready For Pickup"];

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

export async function releaseUnpaidBookings(limit = 50) {
  const unpaidCutoff = new Date(Date.now() - UNPAID_TTL_MS);
  const partialCutoff = new Date(Date.now() - ABANDONED_PARTIAL_TTL_MS);

  const stale = await Booking.find({
    ...NOT_DELETED,
    rideStatus: { $in: HELD_PRE_RIDE },
    pickupOTPVerified: { $ne: true },
    $or: [
      {
        paymentStatus: "Pending",
        receivedAmount: { $lte: 0 },
        createdAt: { $lte: unpaidCutoff },
      },
      {
        receivedAmount: { $gt: 0 },
        pendingAmount: { $gt: 0.009 },
        createdAt: { $lte: partialCutoff },
      },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .select("bookingId riderId vehicleId")
    .lean();

  let released = 0;

  for (const row of stale) {
    const session = await startOptionalTransaction();

    try {
      const bookingQuery = Booking.findOne({
        bookingId: row.bookingId,
        rideStatus: { $in: HELD_PRE_RIDE },
        pickupOTPVerified: { $ne: true },
        ...NOT_DELETED,
      });
      const booking = session ? await bookingQuery.session(session) : await bookingQuery;

      if (!booking) {
        await abortOptionalTransaction(session);
        continue;
      }

      const vehicleQuery = Vehicle.findOne({
        vehicleId: booking.vehicleId,
      });
      const vehicle = session ? await vehicleQuery.session(session) : await vehicleQuery;

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
            updatedBy: "System",
          },
        },
        sessionOpts(session)
      );

      const hadPayment = Number(booking.receivedAmount || 0) > 0.009;
      booking.rideStatus = "Cancelled";
      booking.cancelledBy = "System";
      booking.cancellationReason = hadPayment
        ? "Abandoned partial payment expired"
        : "Unpaid reservation expired";
      booking.pickupOTP = "";
      booking.pickupOTPExpiry = null;
      booking.updatedBy = "System";
      await booking.save(sessionOpts(session));
      if (hadPayment) {
        await queueCancellationRefundIfPaid(booking, session);
      }

      await commitOptionalTransaction(session);
      released += 1;
    } catch (error) {
      await abortOptionalTransaction(session);
      if (isMongoTransactionUnsupported(error)) {
        console.error("RELEASE UNPAID BOOKING STANDALONE FALLBACK:", row.bookingId);
      }
      console.error("RELEASE UNPAID BOOKING ERROR:", row.bookingId, error);
    }
  }

  return { scanned: stale.length, released };
}

export async function openDueRtoDays(limit = 80) {
  const due = await Booking.find({
    ...NOT_DELETED,
    rentalMode: "Rent To Own",
    ownershipTransferred: { $ne: true },
    remainingRentToOwnDays: { $gt: 0 },
    $or: [
      { pendingAmount: { $lte: 0.009 } },
      { pendingAmount: { $exists: false } },
    ],
  })
    .sort({ rtoNextInstallmentAt: 1 })
    .limit(limit);

  let opened = 0;
  for (const booking of due) {
    const before = Number(booking.pendingAmount || 0);
    await openDueRtoInstallment(booking);
    if (Number(booking.pendingAmount || 0) > before + 0.009) opened += 1;
  }
  return { scanned: due.length, opened };
}

let lastSweep = 0;

export async function maybeSweepUnpaidBookings() {
  const now = Date.now();
  if (now - lastSweep < 30 * 1000) return null;
  lastSweep = now;
  try {
    const [unpaid, rto] = await Promise.all([
      releaseUnpaidBookings(100),
      openDueRtoDays(80),
    ]);
    await recordJobHeartbeat("unpaidSweep", { unpaid, rto });
    return { unpaid, rto };
  } catch (error) {
    console.error("UNPAID BOOKING SWEEP ERROR:", error);
    const message = String(error instanceof Error ? error.message : error);
    await recordJobHeartbeat("unpaidSweep", { error: message }, false);
    const { notifyOpsAlert } = await import("@/lib/notify/opsAlert");
    void notifyOpsAlert("Unpaid sweep failed", message);
    return null;
  }
}
