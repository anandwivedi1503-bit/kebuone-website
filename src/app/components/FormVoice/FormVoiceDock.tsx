"use client";

import { Mic, Square } from "lucide-react";

import { useVoiceAssistant } from "../Assistant/useVoiceAssistant";

function fillFocusedField(text: string) {
  const el = document.activeElement;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }
  if (el.disabled || el.readOnly) return false;
  const type = el instanceof HTMLInputElement ? el.type : "text";
  if (["checkbox", "radio", "file", "hidden", "submit", "button"].includes(type)) {
    return false;
  }

  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor?.set?.call(el, text);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

export default function FormVoiceDock({
  hint = "Tap a field, then the mic — speak to fill it.",
}: {
  hint?: string;
}) {
  const { listen, listening, status, supported } = useVoiceAssistant();

  if (!supported) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#E4DDD2] bg-[#FBF9F5] px-4 py-3">
      <button
        type="button"
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Fill the selected field with voice"}
        onClick={() => {
          void listen(
            (text) => {
              if (!fillFocusedField(text)) {
                const first = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                  "form input:not([type=hidden]):not([type=checkbox]):not([type=file]), form textarea"
                );
                first?.focus();
                fillFocusedField(text);
              }
            },
            "auto",
            undefined,
            true
          );
        }}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
          listening
            ? "bg-[#1C1917] text-white shadow-[0_0_0_6px_rgba(31,107,74,0.18)]"
            : "bg-[#1F6B4A] text-white hover:bg-[#18573c]"
        }`}
      >
        {listening ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
      </button>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#1C1917]">
          {listening ? "Listening… tap again to stop" : "Speak to fill"}
        </p>
        <p className="truncate text-xs text-[#8A847A]">{status || hint}</p>
      </div>
    </div>
  );
}
