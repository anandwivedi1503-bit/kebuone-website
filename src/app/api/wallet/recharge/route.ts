import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

export async function POST() {
  const gate = await requireAdminDashboards(...API_DASHBOARDS.walletWrite);
  if (gate.error) return gate.error;

  return NextResponse.json(
    {
      success: false,
      message:
        "Wallet is only the ₹2,500 security-deposit hold. Do not recharge. Refund deposits and cancelled/failed bookings from Refunds via Razorpay.",
    },
    { status: 400 }
  );
}
