export const ASSISTANT_LANGUAGES = [
  { id: "auto", label: "Auto", stt: "", tts: "en-IN" },
  { id: "en", label: "English", stt: "en", tts: "en-IN" },
  { id: "hi", label: "हिन्दी", stt: "hi", tts: "hi-IN" },
  { id: "ta", label: "தமிழ்", stt: "ta", tts: "ta-IN" },
  { id: "te", label: "తెలుగు", stt: "te", tts: "te-IN" },
  { id: "mr", label: "मराठी", stt: "mr", tts: "mr-IN" },
  { id: "bn", label: "বাংলা", stt: "bn", tts: "bn-IN" },
  { id: "gu", label: "ગુજરાતી", stt: "gu", tts: "gu-IN" },
  { id: "kn", label: "ಕನ್ನಡ", stt: "kn", tts: "kn-IN" },
  { id: "ml", label: "മലയാളം", stt: "ml", tts: "ml-IN" },
  { id: "pa", label: "ਪੰਜਾਬੀ", stt: "pa", tts: "pa-IN" },
  { id: "ur", label: "اردو", stt: "ur", tts: "ur-IN" },
] as const;

export type AssistantLanguageId = (typeof ASSISTANT_LANGUAGES)[number]["id"];

export function languageMeta(id: string) {
  return ASSISTANT_LANGUAGES.find((item) => item.id === id) || ASSISTANT_LANGUAGES[0];
}

export function detectScriptLanguage(text: string): AssistantLanguageId {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  if (/[\u0600-\u06FF]/.test(text)) return "ur";
  return "en";
}

export function ttsLangFor(text: string, selected: string) {
  const id = selected === "auto" ? detectScriptLanguage(text) : selected;
  return languageMeta(id).tts;
}

export const LANGUAGE_NAMES: Record<string, string> = {
  auto: "the user's language",
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
};
