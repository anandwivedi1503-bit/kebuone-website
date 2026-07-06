import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

const paymentModes = ["Cash", "UPI", "Card", "Bank Transfer", "Razorpay"];
const paymentStatuses = ["Pending", "Partial", "Paid"];
const rideStatuses = ["Booked", "Reserved", "In Ride", "Completed", "Cancelled"];

const allowedUpdateFields = [
  "rentalEndDate",
  "endHub",
  "receivedAmount",
  "pendingAmount",
  "paymentMode",
  "paymentStatus",
  "paymentDate",
  "rideStatus",
  "remarks",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0;
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
          errors: ["No valid booking update fields received."],
        },
        { status: 400 }
      );
    }

    if (
      updateData.paymentMode &&
      !paymentModes.includes(clean(updateData.paymentMode))
    ) {
      errors.push("Invalid payment mode.");
    }

    if (
      updateData.paymentStatus &&
      !paymentStatuses.includes(clean(updateData.paymentStatus))
    ) {
      errors.push("Invalid payment status.");
    }

    if (
      updateData.rideStatus &&
      !rideStatuses.includes(clean(updateData.rideStatus))
    ) {
      errors.push("Invalid ride status.");
    }

    if (
      updateData.endHub !== undefined &&
      clean(updateData.endHub).length > 0 &&
      clean(updateData.endHub).length < 3
    ) {
      errors.push("End hub is invalid.");
    }

    const amountFields = ["receivedAmount", "pendingAmount"];

    for (const field of amountFields) {
      if (
        updateData[field] !== undefined &&
        !isValidAmount(updateData[field])
      ) {
        errors.push(`${field} must be a valid non-negative amount.`);
      }
    }

    if (updateData.remarks !== undefined) {
      updateData.remarks = clean(updateData.remarks).slice(0, 300);
    }

    if (updateData.endHub !== undefined) {
      updateData.endHub = clean(updateData.endHub);
    }

    if (updateData.paymentMode !== undefined) {
      updateData.paymentMode = clean(updateData.paymentMode);
    }

    if (updateData.paymentStatus !== undefined) {
      updateData.paymentStatus = clean(updateData.paymentStatus);
    }

    if (updateData.rideStatus !== undefined) {
      updateData.rideStatus = clean(updateData.rideStatus);
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

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
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

    return NextResponse.json({
      success: true,
      data: booking,
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

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
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