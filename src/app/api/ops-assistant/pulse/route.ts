import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/adminAuth";
import { getOpsPulse } from "@/lib/opsAssistant";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Sign in to ops first." }, { status: 401 });
    }

    if (!rateLimitAllowed(`ops-pulse:${session.username}`, 60, 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment." },
        { status: 429 }
      );
    }
    if (!rateLimitAllowed(`ops-pulse-ip:${clientIp(req)}`, 90, 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment." },
        { status: 429 }
      );
    }

    const stats = await getOpsPulse(session);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("OPS PULSE:", error);
    return NextResponse.json(
      { success: false, message: "Pulse briefly unavailable." },
      { status: 500 }
    );
  }
}
