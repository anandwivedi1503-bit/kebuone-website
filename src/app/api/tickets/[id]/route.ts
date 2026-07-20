import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Booking from "@/models/Booking";

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
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

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

      updateData.status = status;
    }
    
     if (updateData.status === "RESOLVED") {
  updateData.resolvedAt = new Date();

  const ticket = await Ticket.findById(id);

  if (ticket?.bookingId) {
    await Booking.findOneAndUpdate(
      {
        bookingId: ticket.bookingId,
      },
      {
        $push: {
          remarks: `

Ticket ${ticket.ticketId} resolved on ${new Date().toLocaleString("en-IN")}

`,
        },
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

  if (
    !allowedPriorities.includes(
      String(updateData.priority)
    )
  ) {
    errors.push("Invalid priority.");
  }

}

    if (updateData.assignedTo !== undefined) {
      const assignedTo = clean(updateData.assignedTo);

      if (assignedTo.length < 2 || assignedTo.length > 80) {
        errors.push("Assigned person is invalid.");
      }

      updateData.assignedTo = assignedTo;
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

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedTicket) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Ticket not found."],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTicket,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    await connectDB();

    const { id } = await params;

    await Ticket.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
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