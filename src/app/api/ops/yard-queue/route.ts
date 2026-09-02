import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { getYardQueue } from "@/lib/yardQueue";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

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
