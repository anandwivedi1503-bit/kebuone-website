import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { releaseUnpaidBookings, openDueRtoDays } from "@/lib/jobs/releaseUnpaidBookings";
import { recordJobHeartbeat } from "@/lib/jobHeartbeat";
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
    const [unpaid, rto] = await Promise.all([
      releaseUnpaidBookings(100),
      openDueRtoDays(80),
    ]);
    await recordJobHeartbeat("unpaidSweep", { unpaid, rto, source: "cron" });
    return NextResponse.json({ success: true, unpaid, rto });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    await recordJobHeartbeat(
      "unpaidSweep",
      { error: message, source: "cron" },
      false
    );
    const { notifyOpsAlert } = await import("@/lib/notify/opsAlert");
    void notifyOpsAlert("Unpaid sweep cron failed", message);
    return NextResponse.json(
      { success: false, message: "Unpaid sweep failed." },
      { status: 500 }
    );
  }
}
