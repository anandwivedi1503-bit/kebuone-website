import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import {
  getAdminCommandCenter,
  searchCommandCenter,
} from "@/lib/adminCommandCenter";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  if (!(await rateLimitAllowed(`admin-cc:${session.username}`, 40, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }
  if (!(await rateLimitAllowed(`admin-cc-ip:${clientIp(req)}`, 80, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const q = new URL(req.url).searchParams.get("q") || "";
    if (q.trim().length >= 2) {
      const hits = await searchCommandCenter(session, q);
      return NextResponse.json({ success: true, hits });
    }

    const snapshot = await getAdminCommandCenter(session);
    return NextResponse.json({ success: true, ...snapshot });
  } catch (error) {
    console.error("ADMIN COMMAND CENTER:", error);
    return NextResponse.json(
      { success: false, message: "Command center briefly unavailable." },
      { status: 500 }
    );
  }
}
