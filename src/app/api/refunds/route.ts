import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Refund from "@/models/Refund";
import Booking from "@/models/Booking";
import { applyCreatedCursor, applyOpsListFilters, listResponseFromPage, parseListQuery, withNextCursor } from "@/lib/listQuery";
import { idInScopeFilter, scopedBookingIds } from "@/lib/staffHubScope";
import { attachBookingSnapshotsToRefunds } from "@/lib/opsMoneySummary";
import { writeAudit } from "@/lib/writeAudit";
import { handleRiderDepositRequest, isRiderDepositRequest } from "@/lib/riderDepositRequest";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";

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
    const body = await req.json();
    if (isRiderDepositRequest(body)) {
      return handleRiderDepositRequest(req, body);
    }

   const gate = await requireAdminDashboards(...API_DASHBOARDS.refunds);
    if (gate.error) return gate.error;
        
    await connectDB();

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

const refundSource = ticketId ? "Ticket" : "Booking Cancellation";

const existingBookingRefund =
  await Refund.findOne({
    bookingId: clean(body.bookingId),
    refundSource,
    refundStatus: {
      $ne: "REJECTED",
    },
  });

if (existingBookingRefund) {

  return NextResponse.json(
    {
      success: false,
      errors: [
        `A ${refundSource.toLowerCase()} refund already exists for this booking.`,
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

  refundSource,

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
    const { page, limit, skip, q, cursor } = parsed;
    const filter: Record<string, unknown> = {
      $and: [NOT_DELETED_FILTER],
      $or: [
        { bookingId: { $exists: true, $nin: [null, ""] } },
        { ticketId: { $exists: true, $nin: [null, ""] } },
      ],
    };
    applyOpsListFilters(filter, parsed);
    const bookingIds = await scopedBookingIds(gate.session);
    Object.assign(filter, idInScopeFilter("bookingId", bookingIds));
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

    if (new URL(req.url).searchParams.get("summary") === "1") {
      const rows = await Refund.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $toUpper: { $ifNull: ["$refundStatus", "UNKNOWN"] } },
            count: { $sum: 1 },
            amount: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
      ]);
      const countFor = (...statuses: string[]) =>
        rows
          .filter((row) => statuses.includes(String(row._id || "").toUpperCase()))
          .reduce((sum, row) => sum + Number(row.count || 0), 0);
      const amountFor = (...statuses: string[]) =>
        Math.round(
          rows
            .filter((row) => statuses.includes(String(row._id || "").toUpperCase()))
            .reduce((sum, row) => sum + Number(row.amount || 0), 0) * 100
        ) / 100;
      return NextResponse.json({
        success: true,
        data: [],
        summary: {
          pendingCount: countFor("PROCESSING", "PENDING"),
          refundedCount: countFor("REFUNDED"),
          refundedAmount: amountFor("REFUNDED"),
        },
      });
    }

    applyCreatedCursor(filter, cursor);
    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(cursor ? 0 : skip)
      .limit(limit + 1)
      .lean();
    const payload = listResponseFromPage(refunds, cursor ? 1 : page, limit);
    const data = await attachBookingSnapshotsToRefunds(
      payload.data as Array<Record<string, unknown>>
    );

    return NextResponse.json({
      ...withNextCursor(
        payload,
        payload.data[payload.data.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined
      ),
      data,
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
