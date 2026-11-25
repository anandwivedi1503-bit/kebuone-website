import { NextResponse } from "next/server";

import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { applyCreatedCursor, applyOpsListFilters, listResponseFromPage, parseListQuery, withNextCursor } from "@/lib/listQuery";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { idInScopeFilter, scopedBookingIds, scopedRiderIds } from "@/lib/staffHubScope";

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.audit);
    if (gate.error) return gate.error;

    await connectDB();

    const parsed = parseListQuery(req);
    const { page, limit, skip, q, cursor } = parsed;
    const filter: Record<string, unknown> = {};
    applyOpsListFilters(filter, parsed);
    const bookingIds = await scopedBookingIds(gate.session);
    const riderIds = await scopedRiderIds(gate.session);
    if (bookingIds && riderIds) {
      filter.$and = [
        ...((filter.$and as unknown[]) || []),
        {
          $or: [
            { bookingId: { $in: bookingIds.length ? bookingIds : ["__none__"] } },
            { riderId: { $in: riderIds.length ? riderIds : ["__none__"] } },
          ],
        },
      ];
    }

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [
        { action: rx },
        { entity: rx },
        { entityId: rx },
        { bookingId: rx },
        { riderId: rx },
        { detail: rx },
        { actor: rx },
      ];
    }

    applyCreatedCursor(filter, cursor);
    const rows = await AuditLog.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(cursor ? 0 : skip)
      .limit(limit + 1)
      .lean();

    const payload = listResponseFromPage(rows, cursor ? 1 : page, limit);
    return NextResponse.json(
      withNextCursor(payload, payload.data[payload.data.length - 1] as { createdAt?: unknown; _id?: unknown } | undefined)
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
