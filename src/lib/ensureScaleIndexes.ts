import Booking from "@/models/Booking";
import Battery from "@/models/Battery";
import BatterySwap from "@/models/BatterySwap";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Vehicle from "@/models/Vehicle";
import Wallet from "@/models/Wallet";

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

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { currentHub: 1, createdAt: -1 },
        { background: true, name: "booking_hub_created" }
      ),
    "booking hub createdAt"
  );

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { pickupCity: 1, createdAt: -1 },
        { background: true, name: "booking_city_created" }
      ),
    "booking city createdAt"
  );

  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { lastGpsAt: -1 },
        { background: true, name: "booking_lastGpsAt" }
      ),
    "booking lastGpsAt"
  );

  // Ops Eva / command-center search at thousands of bookings / day
  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { paymentStatus: 1, createdAt: -1 },
        { background: true, name: "ops_booking_payment_created" }
      ),
    "ops booking paymentStatus"
  );
  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { rideStatus: 1, createdAt: -1 },
        { background: true, name: "ops_booking_ride_created" }
      ),
    "ops booking rideStatus"
  );
  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { userPhone: 1, createdAt: -1 },
        { background: true, name: "ops_booking_phone_created" }
      ),
    "ops booking userPhone"
  );
  await createIndexSafe(
    () =>
      Booking.collection.createIndex(
        { bookingId: 1 },
        { background: true, name: "ops_booking_id" }
      ),
    "ops bookingId"
  );
  await createIndexSafe(
    () =>
      Rider.collection.createIndex(
        { phone: 1 },
        { background: true, name: "ops_rider_phone" }
      ),
    "ops rider phone"
  );
  await createIndexSafe(
    () =>
      Rider.collection.createIndex(
        { approvalStatus: 1, createdAt: -1 },
        { background: true, name: "ops_rider_kyc_created" }
      ),
    "ops rider approvalStatus"
  );
  await createIndexSafe(
    () =>
      Vehicle.collection.createIndex(
        { vehicleStatus: 1, updatedAt: -1 },
        { background: true, name: "ops_vehicle_status_updated" }
      ),
    "ops vehicle status"
  );
  await createIndexSafe(
    () =>
      Ticket.collection.createIndex(
        { status: 1, createdAt: -1 },
        { background: true, name: "ops_ticket_status_created" }
      ),
    "ops ticket status"
  );
  await createIndexSafe(
    () =>
      Vehicle.collection.createIndex(
        { currentHub: 1, vehicleStatus: 1, updatedAt: -1 },
        { background: true, name: "ops_vehicle_hub_status" }
      ),
    "ops vehicle hub status"
  );
  await createIndexSafe(
    () =>
      Battery.collection.createIndex(
        { hubId: 1, status: 1 },
        { background: true, name: "ops_battery_hub_status" }
      ),
    "ops battery hub"
  );
  await createIndexSafe(
    () =>
      Battery.collection.createIndex(
        { vehicleId: 1 },
        { background: true, name: "ops_battery_vehicle" }
      ),
    "ops battery vehicle"
  );
  await createIndexSafe(
    () =>
      BatterySwap.collection.createIndex(
        { hubId: 1, createdAt: -1 },
        { background: true, name: "ops_swap_hub_created" }
      ),
    "ops swap hub"
  );
  await createIndexSafe(
    () =>
      Wallet.collection.createIndex(
        { status: 1, updatedAt: -1 },
        { background: true, name: "ops_wallet_status" }
      ),
    "ops wallet status"
  );
}
