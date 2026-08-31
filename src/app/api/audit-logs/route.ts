import { NextResponse } from "next/server";

import { isAdminAuthenticated,
  requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { applyOpsListFilters, listResponse, parseListQuery } from "@/lib/listQuery";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.audit);
    if (gate.error) return gate.error;

    await connectDB();

    const parsed = parseListQuery(req);
    const { page, limit, skip, q } = parsed;
    const filter: Record<string, unknown> = {};
    applyOpsListFilters(filter, parsed);

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

    const [rows, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json(listResponse(rows, total, page, limit));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
