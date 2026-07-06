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

export async function POST(req: Request) {
  try {
   if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
        
    await connectDB();

    const body = await req.json();

    const refundId = clean(body.refundId);
    const ticketId = clean(body.ticketId);
    const gatewayTxnId = clean(body.gatewayTxnId);
    const refundStatus = normalizeStatus(body.refundStatus || "PROCESSING");

    const errors: string[] = [];

    if (!idRegex.test(refundId)) {
      errors.push("Valid refund ID is required.");
    }

    if (!idRegex.test(ticketId)) {
      errors.push("Valid ticket ID is required.");
    }

    if (!isValidAmount(body.amount)) {
      errors.push("Refund amount must be greater than zero.");
    }

    if (gatewayTxnId && !idRegex.test(gatewayTxnId)) {
      errors.push("Gateway transaction ID is invalid.");
    }

    if (!refundStatuses.includes(refundStatus)) {
      errors.push("Invalid refund status.");
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

    const existingRefund = await Refund.findOne({
      refundId,
    });

    if (existingRefund) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Refund ID already exists."],
        },
        { status: 409 }
      );
    }

    const refund = await Refund.create({
      ...body,
      refundId,
      ticketId,
      amount: Number(body.amount),
      gatewayTxnId,
      refundStatus,
    });

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

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const refunds = await Refund.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: refunds,
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