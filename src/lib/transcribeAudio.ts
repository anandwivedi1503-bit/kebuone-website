export async function transcribeAudio(file: File, language = "") {
  const openaiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const groqKey = String(process.env.GROQ_API_KEY || "").trim();

  const body = new FormData();
  body.append("file", file, file.name || "speech.webm");
  body.append("model", openaiKey ? "whisper-1" : "whisper-large-v3");
  if (language && language !== "auto") {
    body.append("language", language);
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body,
    });
    if (!res.ok) throw new Error("openai-transcribe");
    const data = await res.json();
    return String(data.text || "").trim();
  }

  if (groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body,
    });
    if (!res.ok) throw new Error("groq-transcribe");
    const data = await res.json();
    return String(data.text || "").trim();
  }

  return "";
}

export function speechToTextConfigured() {
  return Boolean(
    String(process.env.OPENAI_API_KEY || "").trim() ||
      String(process.env.GROQ_API_KEY || "").trim()
  );
}
