import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { runUnpaidBookingSweep } from "@/lib/jobs/releaseUnpaidBookings";
import { providedSecretMatches } from "@/lib/timingSafe";

export async function POST(req: Request) {
  const cronOk = providedSecretMatches(
    process.env.CRON_SECRET || "",
    req.headers.get("x-cron-secret") || ""
  );
  if (!cronOk) {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.bookingsWrite);
    if (gate.error) return gate.error;
  }

  try {
    await connectDB();
    const result = await runUnpaidBookingSweep("cron");
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    const { notifyOpsAlert } = await import("@/lib/notify/opsAlert");
    void notifyOpsAlert("Unpaid sweep cron failed", message);
    return NextResponse.json(
      { success: false, message: "Unpaid sweep failed." },
      { status: 500 }
    );
  }
}
