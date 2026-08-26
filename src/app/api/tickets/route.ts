import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { publicApiError } from "@/lib/publicError";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import { applyOpsListFilters, listResponse, parseListQuery } from "@/lib/listQuery";
import { writeAudit } from "@/lib/writeAudit";
import Booking from "@/models/Booking";
import { findBookingRider } from "@/lib/findBookingRider";
import Ticket from "@/models/Ticket";
import Vehicle from "@/models/Vehicle";

const idRegex = /^[A-Za-z0-9_-]{3,100}$/;

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

const allowedStatuses = [
  "OPEN",
  "IN-PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const allowedPriorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeCategory(value: unknown) {
  return clean(value).toUpperCase().replace(/\s+/g, "_");
}

function normalizeStatus(value: unknown) {
  return clean(value).toUpperCase().replace("_", "-");
}

function inferCategory(description: string) {
  const text = description.toLowerCase();
  if (/unlock|otp|pickup|lock/.test(text)) return "UNLOCK_ISSUE";
  if (/refund|deposit/.test(text)) return "REFUND_REQUEST";
  if (/pay|razorpay|wallet|cash|gst/.test(text)) return "PAYMENT_ISSUE";
  if (/break|puncture|damage|accident|not start/.test(text)) {
    return "VEHICLE_BREAKDOWN";
  }
  if (/battery|range|charge|swap/.test(text)) return "BATTERY_ISSUE";
  return "BOOKING_ISSUE";
}

function normalizePriority(value: unknown) {
  const priority = clean(value || "Medium").toLowerCase();

  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

async function rollback(session: mongoose.ClientSession | null) {
  if (!session) return;

  try {
    await session.abortTransaction();
  } catch {}

  await session.endSession();
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    if (!rateLimitAllowed(`tickets:${clientIp(req)}`, 12, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, errors: ["Too many requests. Please try again later."] },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await req.json();
    const isAdminRequest = await isAdminAuthenticated();

    const ticketId = clean(body.ticketId).toUpperCase();
    const userId = clean(body.userId).slice(0, 120);
    const tripId = clean(body.tripId);
    const bookingId = clean(body.bookingId).toUpperCase();
    let description = clean(body.description);
    const category = normalizeCategory(
      body.category || inferCategory(description)
    );
    let priority = normalizePriority(body.priority || "Medium");
    const status = isAdminRequest
      ? normalizeStatus(body.status || "OPEN")
      : "OPEN";
    const assignedTo = clean(body.assignedTo || "Admin");

    const errors: string[] = [];

    if (!idRegex.test(ticketId)) {
      errors.push("Valid ticket ID is required.");
    }

    if (userId.length < 2 || userId.length > 120) {
      errors.push("Valid contact identifier is required.");
    }

    if (tripId && !idRegex.test(tripId)) {
      errors.push("Valid trip ID is required.");
    }

    if (!allowedCategories.includes(category)) {
      errors.push("Invalid ticket category.");
    }

    if (description.length < 10 || description.length > 500) {
      errors.push("Description must be between 10 and 500 characters.");
    }

    if (!allowedStatuses.includes(status)) {
      errors.push("Invalid ticket status.");
    }

    if (!allowedPriorities.includes(priority)) {
      errors.push("Invalid priority.");
    }

    if (assignedTo.length < 2 || assignedTo.length > 80) {
      errors.push("Assigned person is invalid.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    const existingTicket = await Ticket.findOne({
      ticketId,
    }).lean();

    if (existingTicket) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Ticket ID already exists."],
        },
        { status: 409 }
      );
    }

    /*
     * Public website contact/enquiry ticket.
     *
     * Booking-linked tickets can be created by admin or by the rider
     * who owns that booking (Firebase token).
     */
    if (!bookingId) {
      const ticket = await Ticket.create({
        ticketId,
        bookingId: "",
        riderId: "",
        userId,
        tripId,
        vehicleId: "",
        riderPhone: "",
        category,
        description,
        priority,
        status: "OPEN",
        assignedTo,
        ticketSource: isAdminRequest ? "Admin Panel" : "Website",
        refundRequired: false,
        adminRemarks: "",
      });

      void writeAudit({
        actor: isAdminRequest ? "Admin" : "Website",
        action: "TICKET_CREATED",
        entity: "Ticket",
        entityId: ticketId,
        detail: category,
      });

      return NextResponse.json(
        {
          success: true,
          data: ticket,
        },
        { status: 201 }
      );
    }

    const firebaseUser = isAdminRequest
      ? null
      : await getVerifiedFirebaseUser(req, body.firebaseIdToken);

    if (!isAdminRequest && !firebaseUser) {
      return unauthorizedResponse();
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findOne({
      bookingId,
    }).session(session);

    if (!booking) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          errors: ["Booking not found."],
        },
        { status: 404 }
      );
    }

    const duplicateOpenTicket = await Ticket.findOne({
      bookingId,
      category,
      status: {
        $in: ["OPEN", "IN-PROGRESS"],
      },
    }).session(session);

    if (duplicateOpenTicket) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          errors: [
            "An active ticket of this type already exists for this booking. Wait for hub staff to resolve it, or send a different issue type.",
          ],
        },
        { status: 409 }
      );
    }

    const rider = await findBookingRider(booking, session);

    if (!rider) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          errors: ["Rider not found."],
        },
        { status: 404 }
      );
    }

    if (!isAdminRequest && (!firebaseUser || !firebaseUserOwnsRider(firebaseUser, rider))) {
      await rollback(session);
      session = null;
      return unauthorizedResponse();
    }

    const rideStatus = String(booking.rideStatus || "");
    if (
      rideStatus === "In Ride" &&
      !/^\[during ride/i.test(description)
    ) {
      description = `[During ride · ${booking.vehicleId || "scooter"}] ${description}`.slice(
        0,
        500
      );
    }
    if (!clean(body.priority)) {
      if (category === "VEHICLE_BREAKDOWN" || category === "BATTERY_ISSUE") {
        priority = rideStatus === "In Ride" ? "Critical" : "High";
      }
    }

    const vehicle = await Vehicle.findOne({
      vehicleId: booking.vehicleId,
    }).session(session);

    if (!vehicle) {
      await rollback(session);
      session = null;

      return NextResponse.json(
        {
          success: false,
          errors: ["Vehicle not found."],
        },
        { status: 404 }
      );
    }

    const [ticket] = await Ticket.create(
      [
        {
          ticketId,
          bookingId,
          riderId: booking.riderId,
          userId: String(booking.userId),
          tripId,
          vehicleId: booking.vehicleId,
          riderPhone: booking.userPhone,
          category,
          description,
          priority,
          status,
          assignedTo,
          ticketSource: isAdminRequest ? "Admin Panel" : "Mobile App",
          refundRequired: category === "REFUND_REQUEST",
          adminRemarks: "",
        },
      ],
      {
        session,
      }
    );

    await session.commitTransaction();
    await session.endSession();
    session = null;

    void writeAudit({
      actor: isAdminRequest ? "Admin" : "Rider",
      action: "TICKET_CREATED",
      entity: "Ticket",
      entityId: ticketId,
      riderId: booking.riderId,
      bookingId,
      detail: category,
    });

    return NextResponse.json(
      {
        success: true,
        data: ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    if (session) {
      await rollback(session);
      session = null;
    }

    return NextResponse.json(
      {
        success: false,
        error: publicApiError(error, "Ticket request failed"),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const parsed = parseListQuery(req);
    const { page, limit, skip, q } = parsed;
    const filter: Record<string, unknown> = {};
    applyOpsListFilters(filter, parsed);

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [
        { ticketId: rx },
        { bookingId: rx },
        { riderId: rx },
        { userId: rx },
        { category: rx },
        { description: rx },
      ];
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Ticket.countDocuments(filter),
    ]);

    return NextResponse.json(listResponse(tickets, total, page, limit));
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: publicApiError(error, "Ticket request failed"),
      },
      { status: 500 }
    );
  }
}
