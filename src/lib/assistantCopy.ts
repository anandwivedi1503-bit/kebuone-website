import { detectScriptLanguage } from "@/lib/assistantLanguages";

export function preferHindi(language: string, text = "") {
  if (language === "hi" || language === "mr") return true;
  if (language === "auto") {
    const detected = detectScriptLanguage(text);
    return detected === "hi" || detected === "mr";
  }
  return false;
}

export function bilingual(language: string, text: string, en: string, hi: string) {
  return preferHindi(language, text) ? hi : en;
}
