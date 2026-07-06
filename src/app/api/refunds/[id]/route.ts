import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";

const idRegex = /^[A-Za-z0-9_-]{3,100}$/;

const refundStatuses = [
  "PROCESSING",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "FAILED",
];

const allowedUpdateFields = [
  "amount",
  "gatewayTxnId",
  "refundStatus",
];

function clean(value: unknown) {
  return String(value || "").trim();
}

function isValidAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 100000;
}

function normalizeStatus(value: unknown) {
  return clean(value).toUpperCase();
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
          errors: ["No valid refund update fields received."],
        },
        { status: 400 }
      );
    }

    if (updateData.amount !== undefined) {
      if (!isValidAmount(updateData.amount)) {
        errors.push("Refund amount must be greater than zero.");
      }

      updateData.amount = Number(updateData.amount);
    }

    if (updateData.gatewayTxnId !== undefined) {
      const gatewayTxnId = clean(updateData.gatewayTxnId);

      if (gatewayTxnId && !idRegex.test(gatewayTxnId)) {
        errors.push("Gateway transaction ID is invalid.");
      }

      updateData.gatewayTxnId = gatewayTxnId;
    }

    if (updateData.refundStatus !== undefined) {
      const refundStatus = normalizeStatus(updateData.refundStatus);

      if (!refundStatuses.includes(refundStatus)) {
        errors.push("Invalid refund status.");
      }

      updateData.refundStatus = refundStatus;
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

    const refund = await Refund.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!refund) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Refund not found."],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: refund,
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

    await Refund.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Refund deleted successfully",
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