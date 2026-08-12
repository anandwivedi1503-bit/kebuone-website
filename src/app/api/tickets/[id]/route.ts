import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Booking from "@/models/Booking";
import mongoose from "mongoose";

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

const allowedCategories = [
  "UNLOCK_ISSUE",
  "OVERCHARGING",
  "VEHICLE_BREAKDOWN",
  "PAYMENT_ISSUE",
  "REFUND_REQUEST",
  "BOOKING_ISSUE",
  "OTHER",
];

const allowedUpdateFields = [

"category",

"description",

"status",

"assignedTo",

"priority",

"adminRemarks",

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    session = await mongoose.startSession();

session.startTransaction();

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const field of allowedUpdateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
        {
          success: false,
          errors: ["No valid ticket update fields received."],
        },
        { status: 400 }
      );
    }

    if (updateData.category !== undefined) {
      const category = normalizeCategory(updateData.category);

      if (!allowedCategories.includes(category)) {
        errors.push("Invalid ticket category.");
      }

      updateData.category = category;
    }

    if (updateData.status !== undefined) {
      const status = normalizeStatus(updateData.status);

      if (!allowedStatuses.includes(status)) {
        errors.push("Invalid ticket status.");
      }

      const existingTicket = await Ticket.findById(id).session(session);

if (!existingTicket) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      errors: ["Ticket not found."],
    },
    {
      status: 404,
    }
  );
}

if (
  status === "CLOSED" &&
  existingTicket.status !== "RESOLVED"
) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json( 
    {
      success: false,
      message:
        "Resolve the ticket before closing it.",
    },
    {
      status: 400,
    }
  );
}

      updateData.status = status;
      if (
  updateData.status === "RESOLVED" &&
  existingTicket.bookingId
) {

  updateData.resolvedAt = new Date();

  await Booking.findOneAndUpdate(
    {
      bookingId: existingTicket.bookingId,
    },
    {
      $push: {
        remarks: `

Ticket ${existingTicket.ticketId} resolved on ${new Date().toLocaleString("en-IN")}

`,
      },
    },
    {
      session,
    }
  );

}
    }
    

     
if (updateData.status === "CLOSED") {
  updateData.closedAt = new Date();
}

    if (updateData.description !== undefined) {
      const description = clean(updateData.description);

      if (description.length < 10 || description.length > 500) {
        errors.push("Description must be between 10 and 500 characters.");
      }

      updateData.description = description;
    }

    if (updateData.priority !== undefined) {

  const priority = clean(updateData.priority);

  const normalizedPriority =
    priority.charAt(0).toUpperCase() +
    priority.slice(1).toLowerCase();

  if (
    !allowedPriorities.includes(
      normalizedPriority
    )
  ) {
    errors.push("Invalid priority.");
  }

  updateData.priority = normalizedPriority;

}

    if (updateData.assignedTo !== undefined) {
      const assignedTo = clean(updateData.assignedTo);

      if (assignedTo.length < 2 || assignedTo.length > 80) {
        errors.push("Assigned person is invalid.");
      }

      updateData.assignedTo = assignedTo;
    }

    if (updateData.adminRemarks !== undefined) {

  const remarks = clean(updateData.adminRemarks);

  if (remarks.length > 1000) {
    errors.push("Admin remarks cannot exceed 1000 characters.");
  }

  updateData.adminRemarks = remarks;

}

    if (errors.length > 0) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
  id,
  updateData,
  {
    new: true,
    runValidators: true,
    session,
  }
);

    if (!updatedTicket) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
        {
          success: false,
          errors: ["Ticket not found."],
        },
        { status: 404 }
      );
    }
    await session.commitTransaction();
session.endSession();
    return NextResponse.json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {

  if (session) {
    try {
      await session.abortTransaction();
    } catch {}

    session.endSession();
  }

  return NextResponse.json(
    {
      success: false,
      error: String(error),
    },
    {
      status: 500,
    }
  );
}
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    session = await mongoose.startSession();

session.startTransaction();

    const { id } = await params;

const ticket = await Ticket.findById(id).session(session);

if (!ticket) {

  await session.abortTransaction();
  session.endSession();

  return NextResponse.json(
    {
      success: false,
      message: "Ticket not found.",
    },
    { status: 404 }
  );
}

if (
  ticket.status === "OPEN" ||
  ticket.status === "IN-PROGRESS"
) {

  await session.abortTransaction();
  session.endSession();
   return NextResponse.json(
    {
      success: false,
      message:
        "Cannot delete an active support ticket.",
    },
    { status: 400 }
  );
}

await Ticket.findByIdAndDelete(
  id,
  {
    session,
  }
);
  await session.commitTransaction();
session.endSession();
    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
 } catch (error) {

  if (session) {
    try {
      await session.abortTransaction();
    } catch {}

    session.endSession();
  }

  return NextResponse.json(
    {
      success: false,
      error: String(error),
    },
    {
      status: 500,
    }
  );
}
}