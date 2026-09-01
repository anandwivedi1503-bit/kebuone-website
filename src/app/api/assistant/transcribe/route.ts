import { NextResponse } from "next/server";

import { speechToTextConfigured, transcribeAudio } from "@/lib/transcribeAudio";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    if (!rateLimitAllowed(`assistant-stt:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before speaking again." },
        { status: 429 }
      );
    }

    const form = await req.formData();
    const file = form.get("audio");
    const language = String(form.get("language") || "auto");

    if (!(file instanceof File) || file.size < 800) {
      return NextResponse.json(
        { success: false, message: "No speech captured. Hold the mic, speak, then tap again." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "Clip is too long. Speak for a few seconds only." },
        { status: 400 }
      );
    }

    if (!speechToTextConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Voice server is not configured yet. Type your question, or use Chrome/Safari speech if the browser offers it.",
        },
        { status: 503 }
      );
    }

    const text = await transcribeAudio(file, language === "auto" ? "" : language);
    if (!text) {
      return NextResponse.json(
        { success: false, message: "Could not hear that. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("ASSISTANT TRANSCRIBE:", error);
    return NextResponse.json(
      { success: false, message: "Voice is briefly unavailable. Please type instead." },
      { status: 500 }
    );
  }
}
