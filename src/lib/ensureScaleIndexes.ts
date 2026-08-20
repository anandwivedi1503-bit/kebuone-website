import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

let started = false;

async function createIndexSafe(
  create: () => Promise<unknown>,
  label: string
) {
  try {
    await create();
  } catch (error) {
    console.error(`SCALE INDEX SKIPPED (${label}):`, error);
  }
}

export async function ensureScaleIndexes() {
  if (started) return;
  started = true;

  await createIndexSafe(async () => {
    try {
      await Vehicle.collection.dropIndex("currentBookingId_1");
    } catch {}
    try {
      await Vehicle.collection.createIndex(
        { currentBookingId: 1 },
        {
          unique: true,
          name: "unique_active_vehicle_booking",
          partialFilterExpression: {
            currentBookingId: { $type: "string", $gt: "" },
          },
          background: true,
        }
      );
    } catch (error) {
      await Vehicle.collection.createIndex(
        { currentBookingId: 1 },
        { background: true }
      );
      throw error;
    }
  }, "vehicle currentBookingId");

  await createIndexSafe(async () => {
    try {
      await Rider.collection.dropIndex("currentBookingId_1");
    } catch {}
    try {
      await Rider.collection.createIndex(
        { currentBookingId: 1 },
        {
          unique: true,
          name: "unique_active_rider_booking",
          partialFilterExpression: {
            currentBookingId: { $type: "string", $gt: "" },
          },
          background: true,
        }
      );
    } catch (error) {
      await Rider.collection.createIndex(
        { currentBookingId: 1 },
        { background: true }
      );
      throw error;
    }
  }, "rider currentBookingId");

  const activeRideStatuses = {
    rideStatus: {
      $in: [
        "Booked",
        "Reserved",
        "Payment Pending",
        "Ready For Pickup",
        "In Ride",
      ],
    },
    isDeleted: { $ne: true },
  };

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { vehicleId: 1 },
        {
          unique: true,
          name: "one_active_booking_per_vehicle",
          partialFilterExpression: activeRideStatuses,
          background: true,
        }
      ),
    "booking vehicle active"
  );

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { riderId: 1 },
        {
          unique: true,
          name: "one_active_booking_per_rider",
          partialFilterExpression: activeRideStatuses,
          background: true,
        }
      ),
    "booking rider active"
  );

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { razorpayPaymentId: 1 },
        {
          unique: true,
          name: "unique_razorpay_payment",
          partialFilterExpression: {
            razorpayPaymentId: { $type: "string", $gt: "" },
          },
          background: true,
        }
      ),
    "booking razorpayPaymentId"
  );
}
