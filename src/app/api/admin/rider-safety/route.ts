import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { listRiderSafetyForAdmin } from "@/lib/riderSafetyOps";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  if (!(await rateLimitAllowed(`admin-safety:${session.username}`, 60, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }
  if (!(await rateLimitAllowed(`admin-safety-ip:${clientIp(req)}`, 120, 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const data = await listRiderSafetyForAdmin(session);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("ADMIN RIDER SAFETY:", error);
    return NextResponse.json(
      { success: false, message: "Rider safety feed unavailable." },
      { status: 500 }
    );
  }
}
