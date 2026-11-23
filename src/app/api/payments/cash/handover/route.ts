import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

/**
 * Keep the old endpoint readable for stale clients, but do not allow a single
 * receipt to bypass the expected-versus-counted cash reconciliation flow.
 */
export async function POST() {
  const gate = await requireAdminDashboards(...API_DASHBOARDS.cashHandover);
  if (gate.error || !gate.session) return gate.error || unauthorizedResponse();
  return NextResponse.json(
    {
      success: false,
      message: "Use Transactions → Cash handover to reconcile the full counted cash total. No handover status was changed.",
    },
    { status: 409 }
  );
}
