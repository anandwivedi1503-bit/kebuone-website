import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { getOpsMoneySummary } from "@/lib/opsMoneySummary";

export async function GET() {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.moneySummary);
    if (gate.error || !gate.session) return gate.error;

    await connectDB();
    const data = await getOpsMoneySummary(gate.session);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("OPS MONEY SUMMARY ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load money summary." },
      { status: 500 }
    );
  }
}
