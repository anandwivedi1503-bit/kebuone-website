import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { publicApiError } from "@/lib/publicError";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Ticket from "@/models/Ticket";
import Vehicle from "@/models/Vehicle";

const idRegex = /^[A-Za-z0-9_-]{3,100}$/;

const allowedCategories = [
  "UNLOCK_ISSUE",
  "OVERCHARGING",
  "VEHICLE_BREAKDOWN",
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
    const category = normalizeCategory(body.category || "OTHER");
    const description = clean(body.description);
    const priority = normalizePriority(body.priority || "Medium");
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
     * Booking-linked tickets stay admin-only below because they touch
     * operational rider, vehicle and refund workflows.
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

      return NextResponse.json(
        {
          success: true,
          data: ticket,
        },
        { status: 201 }
      );
    }

    if (!isAdminRequest) {
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
            "An active support ticket already exists for this booking.",
          ],
        },
        { status: 409 }
      );
    }

    const rider = await Rider.findOne({
      riderId: booking.riderId,
    }).session(session);

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
          ticketSource: "Admin Panel",
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

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const tickets = await Ticket.find().sort({
      createdAt: -1,
    }).limit(300).lean();

    return NextResponse.json({
      success: true,
      data: tickets,
    });
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
