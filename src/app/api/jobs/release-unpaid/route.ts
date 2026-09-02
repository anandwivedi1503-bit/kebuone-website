import { NextResponse } from "next/server";

import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { releaseUnpaidBookings } from "@/lib/jobs/releaseUnpaidBookings";
import { recordJobHeartbeat } from "@/lib/jobHeartbeat";

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET || "";
  const provided = req.headers.get("x-cron-secret") || "";
  const admin = await isAdminAuthenticated().catch(() => false);

  if (!admin && (!cronSecret || provided !== cronSecret)) {
    return unauthorizedResponse();
  }

  await connectDB();
  const result = await releaseUnpaidBookings(100);
  await recordJobHeartbeat("unpaidSweep", { unpaid: result, source: "cron" });
  return NextResponse.json({ success: true, ...result });
}
