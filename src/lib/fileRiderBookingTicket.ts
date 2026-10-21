import { connectDB } from "@/lib/mongodb";
import { nextSeqId } from "@/lib/nextSeqId";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { firebaseUserOwnsRider, type VerifiedFirebaseUser } from "@/lib/requestAuth";
import { writeAudit } from "@/lib/writeAudit";
import { findBookingRider } from "@/lib/findBookingRider";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";

const allowedCategories = [
  "UNLOCK_ISSUE",
  "OVERCHARGING",
  "VEHICLE_BREAKDOWN",
  "BATTERY_ISSUE",
  "PAYMENT_ISSUE",
  "REFUND_REQUEST",
  "BOOKING_ISSUE",
  "OTHER",
];

function inferCategory(description: string) {
  const text = description.toLowerCase();
  if (/unlock|otp|pickup|lock/.test(text)) return "UNLOCK_ISSUE";
  if (/refund|deposit/.test(text)) return "REFUND_REQUEST";
  if (/pay|razorpay|wallet|cash|gst/.test(text)) return "PAYMENT_ISSUE";
  if (/break|puncture|damage|accident|not start/.test(text)) return "VEHICLE_BREAKDOWN";
  if (/battery|range|charge|swap/.test(text)) return "BATTERY_ISSUE";
  return "BOOKING_ISSUE";
}

export async function fileRiderBookingTicket(params: {
  firebaseUser: VerifiedFirebaseUser;
  bookingId: string;
  description: string;
  category?: string;
}) {
  await connectDB();
  const bookingId = String(params.bookingId || "").trim().toUpperCase();
  let description = String(params.description || "").trim().slice(0, 500);
  if (description.length < 10) {
    return { ok: false as const, message: "Describe the issue in at least 10 characters." };
  }
  const categoryRaw = String(params.category || inferCategory(description))
    .toUpperCase()
    .replace(/\s+/g, "_");
  const category = allowedCategories.includes(categoryRaw) ? categoryRaw : "BOOKING_ISSUE";

  const booking = await Booking.findOne({ bookingId, ...NOT_DELETED_FILTER });
  if (!booking) {
    return { ok: false as const, message: "Booking not found." };
  }

  const rider = await findBookingRider(booking);
  if (!rider || !firebaseUserOwnsRider(params.firebaseUser, rider)) {
    return { ok: false as const, message: "Sign in with the booking phone to file a ticket." };
  }

  const duplicate = await Ticket.findOne({
    ...NOT_DELETED_FILTER,
    bookingId,
    category,
    status: { $in: ["OPEN", "IN-PROGRESS"] },
  });
  if (duplicate) {
    return {
      ok: false as const,
      message: `An active ticket ${duplicate.ticketId} of this type already exists. Hub staff are working on it.`,
    };
  }

  const rideStatus = String(booking.rideStatus || "");
  if (rideStatus === "In Ride" && !/^\[during ride/i.test(description)) {
    description = `[During ride · ${booking.vehicleId || "scooter"}] ${description}`.slice(0, 500);
  }

  const ticketId = await nextSeqId("TKT", "ticketSequence");
  const priority =
    (category === "VEHICLE_BREAKDOWN" || category === "BATTERY_ISSUE") && rideStatus === "In Ride"
      ? "Critical"
      : category === "VEHICLE_BREAKDOWN" || category === "BATTERY_ISSUE"
        ? "High"
        : "Medium";

  const ticket = await Ticket.create({
    ticketId,
    bookingId,
    riderId: booking.riderId,
    userId: String(booking.userId || rider.phone || ""),
    tripId: "",
    vehicleId: String(booking.vehicleId || ""),
    riderPhone: booking.userPhone,
    category,
    description,
    priority,
    status: "OPEN",
    assignedTo: "Admin",
    ticketSource: "Mobile App",
    refundRequired: category === "REFUND_REQUEST",
    adminRemarks: "",
  });

  void writeAudit({
    actor: "Rider",
    action: "TICKET_CREATED",
    entity: "Ticket",
    entityId: ticketId,
    riderId: booking.riderId,
    bookingId,
    detail: category,
  });

  return { ok: true as const, ticketId: String(ticket.ticketId), category };
}
