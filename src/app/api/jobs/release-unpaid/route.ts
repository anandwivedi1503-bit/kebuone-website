import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { releaseUnpaidBookings } from "@/lib/jobs/releaseUnpaidBookings";
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

  await connectDB();
  const result = await releaseUnpaidBookings(100);
  await recordJobHeartbeat("unpaidSweep", { unpaid: result, source: "cron" });
  return NextResponse.json({ success: true, ...result });
}
