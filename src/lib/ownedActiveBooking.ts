import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

export async function getOwnedActiveBooking(req: Request) {
  const firebaseUser = await getVerifiedFirebaseUser(req);
  if (!firebaseUser) {
    return { error: { status: 401, message: "Sign in required." } as const };
  }

  const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
    { firebaseUid: firebaseUser.uid },
  ];
  if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

  const rider = await Rider.findOne({
    $and: [NOT_DELETED, { $or: riderLookups }],
  });

  if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
    return { error: { status: 404, message: "Rider not found." } as const };
  }

  const booking = await Booking.findOne({
    riderId: rider.riderId,
    $and: [
      NOT_DELETED,
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
    return { error: { status: 404, message: "No active booking found." } as const };
  }

  return { rider, booking, firebaseUser };
}
