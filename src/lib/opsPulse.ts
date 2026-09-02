import { API_DASHBOARDS } from "@/lib/adminCan";
import { sessionHasAnyDashboard, type AdminSessionInfo } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import type { OpsStat } from "@/lib/opsSearch";
import Booking from "@/models/Booking";
import Refund from "@/models/Refund";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Vehicle from "@/models/Vehicle";
import {
  applyHubScope,
  idInScopeFilter,
  scopedBookingIds,
  scopedRiderIds,
  sessionHubScope,
} from "@/lib/staffHubScope";

function can(session: AdminSessionInfo, keys: readonly string[]) {
  return sessionHasAnyDashboard(session, ...keys);
}

/** Fast live pulse for the ops command center. */
export async function getOpsPulse(session: AdminSessionInfo): Promise<OpsStat[]> {
  await connectDB();
  const stats: OpsStat[] = [];
  const tasks: Array<Promise<void>> = [];
  const hubs = sessionHubScope(session);
  const bookingIds = await scopedBookingIds(session);
  const riderIds = await scopedRiderIds(session);
  const bookingBase = applyHubScope({ ...NOT_DELETED_FILTER }, hubs, [
    "currentHub",
    "startHub",
  ]);
  const vehicleBase = applyHubScope({ ...NOT_DELETED_FILTER }, hubs, ["currentHub"]);
  const ticketScope = idInScopeFilter("bookingId", bookingIds);
  const riderScope = idInScopeFilter("riderId", riderIds);
  const refundScope = idInScopeFilter("bookingId", bookingIds);

  if (can(session, API_DASHBOARDS.bookingsRead)) {
    tasks.push(
      (async () => {
        const [unpaid, inRide, rtoDue] = await Promise.all([
          Booking.countDocuments({
            ...bookingBase,
            paymentStatus: { $in: ["Pending", "Partial"] },
          }).maxTimeMS(1800),
          Booking.countDocuments({
            ...bookingBase,
            rideStatus: "In Ride",
          }).maxTimeMS(1800),
          Booking.countDocuments({
            ...bookingBase,
            rentalMode: "Rent To Own",
            paymentStatus: { $in: ["Pending", "Partial"] },
          }).maxTimeMS(1800),
        ]);
        stats.push(
          { label: "Unpaid", value: String(unpaid), dashboard: "bookings" },
          { label: "In ride", value: String(inRide), dashboard: "fleet" },
          { label: "RTO due", value: String(rtoDue), dashboard: "renttoown" }
        );
      })()
    );
  }
  if (can(session, API_DASHBOARDS.tickets)) {
    tasks.push(
      (async () => {
        const open = await Ticket.countDocuments({
          ...NOT_DELETED_FILTER,
          ...ticketScope,
          status: { $in: ["OPEN", "IN-PROGRESS"] },
        }).maxTimeMS(1800);
        stats.push({ label: "Tickets", value: String(open), dashboard: "support" });
      })()
    );
  }
  if (can(session, API_DASHBOARDS.ridersRead)) {
    tasks.push(
      (async () => {
        const pending = await Rider.countDocuments({
          ...NOT_DELETED_FILTER,
          ...riderScope,
          $or: [{ approvalStatus: "Pending" }, { status: "Pending" }],
        }).maxTimeMS(1800);
        stats.push({ label: "KYC", value: String(pending), dashboard: "kyc" });
      })()
    );
  }
  if (can(session, API_DASHBOARDS.vehiclesRead)) {
    tasks.push(
      (async () => {
        const available = await Vehicle.countDocuments({
          ...vehicleBase,
          vehicleStatus: "Available",
        }).maxTimeMS(1800);
        stats.push({ label: "Available", value: String(available), dashboard: "vehicles" });
      })()
    );
  }
  if (can(session, API_DASHBOARDS.refunds)) {
    tasks.push(
      (async () => {
        const pending = await Refund.countDocuments({
          ...NOT_DELETED_FILTER,
          ...refundScope,
          status: "PENDING",
        }).maxTimeMS(1800);
        stats.push({ label: "Refunds", value: String(pending), dashboard: "refunds" });
      })()
    );
  }

  await Promise.all(tasks);
  return stats;
}
