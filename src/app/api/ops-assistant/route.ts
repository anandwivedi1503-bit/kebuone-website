import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/adminAuth";
import { runOpsAssistant } from "@/lib/opsAssistant";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Sign in to ops first." }, { status: 401 });
    }

    if (!rateLimitAllowed(`ops-assistant:${session.username}`, 50, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    if (!rateLimitAllowed(`ops-assistant-ip:${clientIp(req)}`, 80, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = String(body.question || "").trim();
    const language = String(body.language || "auto").trim();
    const result = await runOpsAssistant(session, question, language);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      hits: result.hits,
      stats: result.stats,
      action: result.action || null,
      elapsedMs: result.elapsedMs || 0,
      mode: result.mode || "search",
    });
  } catch (error) {
    console.error("OPS ASSISTANT:", error);
    return NextResponse.json(
      { success: false, message: "Ops assistant is briefly unavailable." },
      { status: 500 }
    );
  }
}
