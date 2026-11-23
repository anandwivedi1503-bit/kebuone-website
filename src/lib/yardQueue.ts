import {
  applyHubScope,
  idInScopeFilter,
  scopedBookingIds,
  resolveHubScope,
} from "@/lib/staffHubScope";
import type { AdminSessionInfo } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { redactBookingOtps } from "@/lib/listQuery";
import {
  hasPickupPaymentMinimum,
  isPickupOtpTestRider,
  pickupPaymentTopUp,
} from "@/lib/pickupPaymentRule";
import Booking from "@/models/Booking";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";

const LIVE_RIDES = [
  "Booked",
  "Reserved",
  "Payment Pending",
  "Ready For Pickup",
  "In Ride",
];

export async function getYardQueue(session: AdminSessionInfo) {
  await connectDB();
  const hubs = await resolveHubScope(session);
  const scope = (extra: Record<string, unknown> = {}) =>
    applyHubScope(
      { ...NOT_DELETED_FILTER, ...extra },
      hubs,
      ["currentHub", "startHub"]
    );

  const bookingIds = await scopedBookingIds(session);
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
      ...idInScopeFilter("bookingId", bookingIds),
      refundStatus: { $in: ["PENDING", "PROCESSING"] },
    }).maxTimeMS(2500),
    Booking.find(
      scope({
        rideStatus: { $in: LIVE_RIDES },
        vehicleId: { $exists: true, $nin: ["", null] },
      })
    )
      .select(
        "bookingId vehicleId riderId userName userPhone rideStatus paymentStatus receivedAmount pendingAmount paymentDue rateApplied totalAmount gstAmount securityDeposit rentalMode currentHub startHub currentBookingId createdAt pickupOTP pickupOTPExpiry pickupOTPVerified rideEndOTP riderReturnedAt"
      )
      .sort({ updatedAt: -1 })
      .limit(120)
      .lean(),
  ]);
  const riderIds = Array.from(
    new Set(
      liveBookings
        .map((row) => String((row as Record<string, unknown>).riderId || "").trim())
        .filter(Boolean)
    )
  );
  const riderPhones = riderIds.length
    ? await Rider.find({
        $and: [NOT_DELETED_FILTER, { riderId: { $in: riderIds } }],
      })
        .select("riderId phone")
        .lean()
    : [];
  const phoneByRiderId = new Map(
    riderPhones.map((rider) => [String(rider.riderId || ""), String(rider.phone || "")])
  );

  return {
    counts: {
      readyForPickup,
      inRide,
      unpaid,
      rtoDue,
      pendingRefunds,
    },
    liveBookings: liveBookings.map((row) => {
      const booking = row as Record<string, unknown>;
      const paymentMinimumBooking = {
        ...booking,
        userPhone:
          booking.userPhone || phoneByRiderId.get(String(booking.riderId || "")) || "",
      };
      const pickupOtpTestMode = isPickupOtpTestRider(paymentMinimumBooking);
      return {
        ...redactBookingOtps(booking),
        pickupOtpTestMode,
        pickupPaymentMinimumMet: hasPickupPaymentMinimum(paymentMinimumBooking),
        pickupPaymentTopUp: pickupPaymentTopUp(paymentMinimumBooking),
      };
    }),
  };
}
