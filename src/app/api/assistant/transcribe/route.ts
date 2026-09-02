import { NextResponse } from "next/server";

import { speechToTextConfigured, transcribeAudio } from "@/lib/transcribeAudio";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    if (!(await rateLimitAllowed(`assistant-stt:${clientIp(req)}`, 20, 10 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, message: "थोड़ी देर बाद फिर बोलकर देखें।" },
        { status: 429 }
      );
    }

    const form = await req.formData();
    const file = form.get("audio");
    const language = String(form.get("language") || "hi");

    if (!(file instanceof File) || file.size < 800) {
      return NextResponse.json(
        {
          success: false,
          message: "आवाज़ नहीं मिली। माइक दबाएँ, साफ़ बोलें, फिर रोकने के लिए फिर दबाएँ।",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: "बहुत लंबी क्लिप है। कुछ सेकंड ही बोलें।" },
        { status: 400 }
      );
    }

    if (!speechToTextConfigured()) {
      return NextResponse.json(
        {
          success: false,
          code: "STT_NOT_CONFIGURED",
          message:
            "वॉइस सर्वर अभी सेट नहीं है। Chrome/Safari में बोलें (ब्राउज़र सुन लेगा) या सवाल टाइप करें।",
        },
        { status: 503 }
      );
    }

    const text = await transcribeAudio(file, language === "auto" ? "hi" : language);
    if (!text) {
      return NextResponse.json(
        { success: false, message: "सुनाई नहीं दी। फिर से साफ़ बोलकर देखें।" },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("ASSISTANT TRANSCRIBE:", error);
    return NextResponse.json(
      { success: false, message: "आवाज़ अभी उपलब्ध नहीं। कृपया टाइप करें।" },
      { status: 500 }
    );
  }
}
