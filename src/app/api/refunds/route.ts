import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Booking from "@/models/Booking";
import { applyOpsListFilters, listResponse, parseListQuery } from "@/lib/listQuery";
import { attachBookingSnapshotsToRefunds } from "@/lib/opsMoneySummary";
import { writeAudit } from "@/lib/writeAudit";

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
   const gate = await requireAdminDashboards(...API_DASHBOARDS.refunds);
    if (gate.error) return gate.error;
        
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

    const booking = await Booking.findOne({
  bookingId: clean(body.bookingId),
});

if (!booking) {

  return NextResponse.json(
    {
      success: false,
      errors: [
        "Booking not found.",
      ],
    },
    {
      status: 404,
    }
  );

}

const existingBookingRefund =
  await Refund.findOne({
    bookingId: clean(body.bookingId),
    refundStatus: {
      $ne: "REJECTED",
    },
  });

if (existingBookingRefund) {

  return NextResponse.json(
    {
      success: false,
      errors: [
        "A refund already exists for this booking.",
      ],
    },
    {
      status: 409,
    }
  );

}

    const refund = await Refund.create({
  ...body,

  refundId,

  bookingId: clean(body.bookingId),

  ticketId,

  riderId: clean(body.riderId),

  amount: Number(body.amount),

  gatewayTxnId,

  refundStatus,

  remarks: clean(body.remarks),

  processedBy: clean(body.processedBy),

  processedAt:
    refundStatus === "REFUNDED"
      ? new Date()
      : undefined,
});
    void writeAudit({
      actor: "Admin",
      action: "REFUND_CREATED",
      entity: "Refund",
      entityId: refundId,
      riderId: clean(body.riderId),
      bookingId: clean(body.bookingId),
      detail: String(body.amount),
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

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.refunds);
    if (gate.error) return gate.error;
    await connectDB();

    const parsed = parseListQuery(req);
    const { page, limit, skip, q } = parsed;
    const filter: Record<string, unknown> = {
      $or: [
        { bookingId: { $exists: true, $nin: [null, ""] } },
        { ticketId: { $exists: true, $nin: [null, ""] } },
      ],
    };
    applyOpsListFilters(filter, parsed);
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      const and = (filter.$and as unknown[]) || [];
      if (filter.$or) and.unshift({ $or: filter.$or });
      and.push({
        $or: [{ refundId: rx }, { bookingId: rx }, { riderId: rx }, { ticketId: rx }],
      });
      filter.$and = and;
      delete filter.$or;
    }

    const refunds = await Refund.find(filter).sort({ createdAt: -1 }).limit(2000).lean();
    const linked = (
      await attachBookingSnapshotsToRefunds(refunds as Array<Record<string, unknown>>)
    ).filter(
      (row) =>
        Boolean(row.bookingSnapshot) ||
        Boolean(String((row as { ticketId?: unknown }).ticketId || "").trim())
    );
    const total = linked.length;
    const data = linked.slice(skip, skip + limit);

    return NextResponse.json(listResponse(data, total, page, limit));
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