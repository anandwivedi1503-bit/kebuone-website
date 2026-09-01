import { NextResponse } from "next/server";

import { answerEvuddyQuestion, assistantConfigured, type ChatTurn } from "@/lib/assistantReply";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    if (!rateLimitAllowed(`assistant:${clientIp(req)}`, 30, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "थोड़ी देर बाद फिर पूछें।" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = String(body.question || body.message || "").trim();
    // Eva replies only in Hindi for every rider.
    const language = "hi";
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history: ChatTurn[] = rawHistory
      .slice(-6)
      .map((turn: { role?: string; content?: string }) => ({
        role: turn.role === "assistant" ? "assistant" : "user",
        content: String(turn.content || "").slice(0, 500),
      }));

    const reply = await answerEvuddyQuestion(history, question, language);
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
        message: "अभी असिस्टेंट उपलब्ध नहीं है। Book EV या हेल्पडेस्क इस्तेमाल करें।",
      },
      { status: 500 }
    );
  }
}
