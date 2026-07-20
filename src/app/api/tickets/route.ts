import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
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

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeCategory(value: unknown) {
  return clean(value).toUpperCase().replace(/\s+/g, "_");
}

function normalizeStatus(value: unknown) {
  return clean(value).toUpperCase().replace("_", "-");
}

export async function POST(req: Request) {
  try {
        
    await connectDB();

    const body = await req.json();

    const ticketId = clean(body.ticketId);
    const userId = clean(body.userId);
    const tripId = clean(body.tripId);
    const bookingId = clean(body.bookingId);
    const category = normalizeCategory(body.category || "UNLOCK_ISSUE");
    const description = clean(body.description);
    const status = normalizeStatus(body.status || "OPEN");
    const assignedTo = clean(body.assignedTo || "Admin");

    const errors: string[] = [];

    const booking = await Booking.findOne({
  bookingId,
});

if (!booking) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Booking not found."],
    },
    { status: 404 }
  );
}

const rider = await Rider.findOne({
  riderId: booking.riderId,
});

if (!rider) {
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
});

if (!vehicle) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Vehicle not found."],
    },
    { status: 404 }
  );
}

    if (!idRegex.test(ticketId)) {
      errors.push("Valid ticket ID is required.");
    }

    if (!bookingId) {
  errors.push("Booking ID is required.");
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
    });

    const duplicateOpenTicket = await Ticket.findOne({
  bookingId,
  status: {
    $in: ["OPEN", "IN-PROGRESS"],
  },
});

if (duplicateOpenTicket) {
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

    if (existingTicket) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Ticket ID already exists."],
        },
        { status: 409 }
      );
    }

    const ticket = await Ticket.create({
  ticketId,

  bookingId,

  riderId: booking.riderId,

  userId: String(booking.userId),

  tripId,

  vehicleId: booking.vehicleId,

  riderPhone: booking.userPhone,

  category,

  description,

  priority: body.priority || "Medium",

  status,

  assignedTo,

  refundRequired:
    category === "REFUND_REQUEST",

  adminRemarks: "",
});

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
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
    });

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}