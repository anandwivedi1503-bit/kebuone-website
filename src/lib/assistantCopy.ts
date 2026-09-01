import { detectScriptLanguage } from "@/lib/assistantLanguages";

export function preferHindi(language: string, text = "") {
  // Default Eva experience is simple Hindi for common users.
  if (!language || language === "hi" || language === "mr" || language === "auto") return true;
  if (language === "en") return false;
  const detected = detectScriptLanguage(text);
  return detected === "hi" || detected === "mr";
}

export function bilingual(language: string, text: string, en: string, hi: string) {
  return preferHindi(language, text) ? hi : en;
}
