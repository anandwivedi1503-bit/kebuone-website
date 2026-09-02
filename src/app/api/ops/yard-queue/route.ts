import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { getYardQueue } from "@/lib/yardQueue";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const gate = await requireAdminDashboards(...API_DASHBOARDS.yardQueue);
  if (gate.error) return gate.error;
  if (!gate.session) return unauthorizedResponse();
  const session = gate.session;

  if (!(await rateLimitAllowed(`yard-queue:${session.username}`, 40, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }
  if (!(await rateLimitAllowed(`yard-queue-ip:${clientIp(req)}`, 80, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const data = await getYardQueue(session);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("YARD QUEUE:", error);
    return NextResponse.json(
      { success: false, message: "Yard queue briefly unavailable." },
      { status: 500 }
    );
  }
}
