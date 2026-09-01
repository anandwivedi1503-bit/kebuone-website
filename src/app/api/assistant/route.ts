import { NextResponse } from "next/server";

import { answerEvuddyQuestion, assistantConfigured, type ChatTurn } from "@/lib/assistantReply";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    if (!rateLimitAllowed(`assistant:${clientIp(req)}`, 30, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before asking again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = String(body.question || body.message || "").trim();
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatTurn[] = rawHistory
      .slice(-6)
      .map((turn: { role?: string; content?: string }) => ({
        role: turn.role === "assistant" ? "assistant" : "user",
        content: String(turn.content || "").slice(0, 500),
      }));

    const reply = await answerEvuddyQuestion(history, question);
    return NextResponse.json({
      success: true,
      answer: reply.answer,
      href: reply.href || "",
      navigate: Boolean(reply.navigate),
      mode: assistantConfigured() ? "ai" : "guide",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Assistant is briefly unavailable. Use Book a bike or contact." },
      { status: 500 }
    );
  }
}
