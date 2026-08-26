import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export async function getOwnedActiveBooking(req: Request) {
  const firebaseUser = await getVerifiedFirebaseUser(req);
  if (!firebaseUser) {
    return { ok: false as const, status: 401, message: "Sign in required." };
  }

  const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
    { firebaseUid: firebaseUser.uid },
  ];
  if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

  const rider = await Rider.findOne({
    $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
  });

  if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
    return { ok: false as const, status: 404, message: "Rider not found." };
  }

  const booking = await Booking.findOne({
    $and: [
      bookingBelongsToRiderFilter(rider),
      NOT_DELETED_FILTER,
      { rideStatus: { $ne: "Cancelled" } },
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
  }).sort({ createdAt: -1 });

  if (!booking) {
    return { ok: false as const, status: 404, message: "No active booking found." };
  }

  return { ok: true as const, rider, booking, firebaseUser };
}
