import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/adminAuth";
import {
  formatOpsAnswer,
  opsAssistantBlocked,
  searchOpsRecords,
} from "@/lib/opsAssistant";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Sign in to ops first." }, { status: 401 });
    }

    if (!rateLimitAllowed(`ops-assistant:${session.username}`, 40, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    if (!rateLimitAllowed(`ops-assistant-ip:${clientIp(req)}`, 60, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = String(body.question || "").trim();
    if (question.length < 2) {
      return NextResponse.json({
        success: true,
        answer:
          "Ask for a booking ID, rider phone, unpaid bookings, in-ride scooters, or open tickets. I search live ops data for this login. I cannot pay, refund, or enter OTP.",
        hits: [],
      });
    }

    if (opsAssistantBlocked(question) && /\b(for me|do it|now|approve|complete|enter)\b/i.test(question)) {
      return NextResponse.json({
        success: true,
        answer:
          "I cannot pay, refund, unlock, delete, or enter OTP. Open the matching dashboard and use the staff buttons.",
        hits: [],
      });
    }

    const hits = await searchOpsRecords(session, question);
    return NextResponse.json({
      success: true,
      answer: formatOpsAnswer(question, hits),
      hits,
    });
  } catch (error) {
    console.error("OPS ASSISTANT:", error);
    return NextResponse.json(
      { success: false, message: "Ops assistant is briefly unavailable." },
      { status: 500 }
    );
  }
}
