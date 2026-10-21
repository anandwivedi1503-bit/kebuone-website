import { NextResponse } from "next/server";

import { answerEvuddyQuestion, assistantConfigured, type ChatTurn } from "@/lib/assistantReply";
import { fileRiderBookingTicket } from "@/lib/fileRiderBookingTicket";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { getVerifiedFirebaseUser } from "@/lib/requestAuth";
import { loadEvaRiderSession } from "@/lib/riderAssistantHelp";
import { wantsFileSupportTicket } from "@/lib/riderAssistantIntent";

export async function POST(req: Request) {
  try {
    if (!(await rateLimitAllowed(`assistant:${clientIp(req)}`, 20, 10 * 60 * 1000))) {
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

    if (wantsFileSupportTicket(question) && riderSession?.bookingId) {
      const firebaseUser = await getVerifiedFirebaseUser(req, body.firebaseIdToken);
      if (firebaseUser) {
        const filed = await fileRiderBookingTicket({
          firebaseUser,
          bookingId: riderSession.bookingId,
          description: question,
        });
        if (filed.ok) {
          return NextResponse.json({
            success: true,
            answer: `${riderSession.firstName ? `${riderSession.firstName} जी, ` : ""}शिकायत टिकट ${filed.ticketId} बन गया (${filed.category.replace(/_/g, " ")}). स्टाफ Support डैशबोर्ड पर देखेंगे। Book EV / Rent to Own पेमेंट के नीचे भी स्टेटस दिखेगा। OTP या पैसे मैं नहीं लेती।`,
            href: riderSession.href || "/book-bike",
            navigate: false,
            mode: assistantConfigured() ? "ai" : "guide",
          });
        }
        return NextResponse.json({
          success: true,
          answer: `${riderSession.firstName ? `${riderSession.firstName} जी, ` : ""}टिकट अभी नहीं बना: ${filed.message} Book EV / Rent to Own पेमेंट स्टेप के नीचे वाला फॉर्म भी इस्तेमाल कर सकते हैं।`,
          href: riderSession.href || "/book-bike",
          navigate: true,
          mode: assistantConfigured() ? "ai" : "guide",
        });
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
