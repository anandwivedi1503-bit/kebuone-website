import { applyHubScope, sessionHubScope } from "@/lib/staffHubScope";
import type { AdminSessionInfo } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { redactBookingOtps } from "@/lib/listQuery";
import Booking from "@/models/Booking";
import Refund from "@/models/Refund";

const LIVE_RIDES = ["Ready For Pickup", "In Ride"];

export async function getYardQueue(session: AdminSessionInfo) {
  await connectDB();
  const hubs = sessionHubScope(session);
  const scope = (extra: Record<string, unknown> = {}) =>
    applyHubScope(
      { ...NOT_DELETED_FILTER, ...extra },
      hubs,
      ["currentHub", "startHub"]
    );

  const [
    readyForPickup,
    inRide,
    unpaid,
    rtoDue,
    pendingRefunds,
    liveBookings,
  ] = await Promise.all([
    Booking.countDocuments(scope({ rideStatus: "Ready For Pickup" })).maxTimeMS(2500),
    Booking.countDocuments(scope({ rideStatus: "In Ride" })).maxTimeMS(2500),
    Booking.countDocuments(
      scope({
        rideStatus: { $nin: ["Cancelled", "Completed"] },
        paymentStatus: { $in: ["Pending", "Partial"] },
      })
    ).maxTimeMS(2500),
    Booking.countDocuments(
      scope({
        rentalMode: "Rent To Own",
        paymentStatus: { $in: ["Pending", "Partial"] },
        ownershipTransferred: { $ne: true },
      })
    ).maxTimeMS(2500),
    Refund.countDocuments({
      ...NOT_DELETED_FILTER,
      refundStatus: { $in: ["PENDING", "PROCESSING"] },
    }).maxTimeMS(2500),
    Booking.find(scope({ rideStatus: { $in: LIVE_RIDES } }))
      .select(
        "bookingId vehicleId riderId userName userPhone rideStatus paymentStatus receivedAmount pendingAmount currentHub startHub currentBookingId createdAt pickupOTP pickupOTPVerified"
      )
      .sort({ updatedAt: -1 })
      .limit(120)
      .lean(),
  ]);

  return {
    counts: {
      readyForPickup,
      inRide,
      unpaid,
      rtoDue,
      pendingRefunds,
    },
    liveBookings: liveBookings.map((row) =>
      redactBookingOtps(row as Record<string, unknown>)
    ),
  };
}
