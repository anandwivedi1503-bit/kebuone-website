import { NextResponse } from "next/server";

import { answerEvuddyQuestion, assistantConfigured, type ChatTurn } from "@/lib/assistantReply";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { loadEvaRiderSession } from "@/lib/riderAssistantHelp";

export async function POST(req: Request) {
  try {
    if (!(await rateLimitAllowed(`assistant:${clientIp(req)}`, 30, 10 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, message: "थोड़ी देर बाद फिर पूछें जी।" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = String(body.question || body.message || "").trim();
    const language = "hi";
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatTurn[] = rawHistory
      .slice(-6)
      .map((turn: { role?: string; content?: string }) => ({
        role: turn.role === "assistant" ? "assistant" : "user",
        content: String(turn.content || "").slice(0, 500),
      }));

    let riderSession = null;
    const hasToken =
      Boolean(String(body.firebaseIdToken || "").trim()) ||
      Boolean(req.headers.get("authorization")?.trim());
    if (hasToken) {
      try {
        await connectDB();
        riderSession = await loadEvaRiderSession(req, body.firebaseIdToken);
      } catch (error) {
        console.error("ASSISTANT RIDER SESSION SKIPPED:", error);
      }
    }

    const reply = await answerEvuddyQuestion(history, question, language, riderSession);
    return NextResponse.json({
      success: true,
      answer: reply.answer,
      href: reply.href || "",
      navigate: Boolean(reply.navigate),
      mode: assistantConfigured() ? "ai" : "guide",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "अभी Eva नहीं खुल पाई। Book EV या हेल्पडेस्क इस्तेमाल कीजिए।",
      },
      { status: 500 }
    );
  }
}
