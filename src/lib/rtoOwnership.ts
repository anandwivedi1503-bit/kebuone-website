import type mongoose from "mongoose";

import Rider from "@/models/Rider";
import Vehicle from "@/models/Vehicle";

type OwnedBooking = {
  bookingId?: string;
  riderId?: string;
  vehicleId?: string;
  ownershipTransferred?: boolean;
};

/** After the last RTO day is paid, the scooter leaves the rental pool and the rider lock is cleared. */
export async function retireOwnedRtoAssets(
  booking: OwnedBooking,
  session?: mongoose.ClientSession | null
) {
  if (!booking.ownershipTransferred) return;
  const sessionOpt = session ? { session } : {};

  if (booking.vehicleId) {
    await Vehicle.findOneAndUpdate(
      { vehicleId: booking.vehicleId },
      {
        $set: {
          isActive: false,
          vehicleStatus: "Maintenance",
          currentBookingId: "",
          currentRiderId: "",
          assignedRider: String(booking.riderId || ""),
          lockStatus: "Unlocked",
        },
      },
      sessionOpt
    );
  }

  if (booking.riderId && booking.bookingId) {
    await Rider.findOneAndUpdate(
      {
        riderId: booking.riderId,
        currentBookingId: booking.bookingId,
      },
      {
        $set: {
          activeRide: false,
          currentBookingId: "",
          currentTripId: "",
          lastBookingId: booking.bookingId,
        },
      },
      sessionOpt
    );
  }
}
