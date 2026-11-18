import type mongoose from "mongoose";

import Booking from "@/models/Booking";

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};

/** First completed standard rental is free. Deposit is still charged. Rent-to-own is excluded. */
export async function riderQualifiesForFirstRideFree(
  riderId: string,
  session?: mongoose.ClientSession | null
) {
  const id = String(riderId || "").trim();
  if (!id) return false;
  const query = Booking.countDocuments({
    riderId: id,
    rideStatus: "Completed",
    rentalMode: { $ne: "Rent To Own" },
    ...NOT_DELETED,
  });
  const completed = session ? await query.session(session) : await query;
  return completed === 0;
}
