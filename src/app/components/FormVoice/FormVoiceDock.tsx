"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Mic, Square } from "lucide-react";

import { COMING_THROUGH_OPTIONS } from "@/lib/partnerSegments";
import { useVoiceAssistant } from "../Assistant/useVoiceAssistant";

export const PREMIUM_FIELD =
  "h-14 w-full rounded-[22px] border border-[#E6EBE7] bg-white px-4 pr-12 text-[15px] text-[#1C1917] outline-none transition placeholder:text-[#9AA39C] focus:border-[#1F6B4A] focus:ring-4 focus:ring-[#1F6B4A]/10 disabled:bg-[#F4F6F4] disabled:text-[#8A847A]";

export const PREMIUM_AREA =
  "min-h-28 w-full rounded-[22px] border border-[#E6EBE7] bg-white px-4 py-3 pr-12 text-[15px] text-[#1C1917] outline-none transition placeholder:text-[#9AA39C] focus:border-[#1F6B4A] focus:ring-4 focus:ring-[#1F6B4A]/10";

export const PREMIUM_SELECT =
  "h-14 w-full appearance-none rounded-[22px] border border-[#E6EBE7] bg-white px-4 text-[15px] text-[#1C1917] outline-none transition focus:border-[#1F6B4A] focus:ring-4 focus:ring-[#1F6B4A]/10";

export const PREMIUM_BTN =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

export const PREMIUM_LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]";

function digitsOnly(text: string, max = 10) {
  return text.replace(/\D/g, "").slice(0, max);
}

export function FieldMic({
  onText,
  disabled,
  label,
}: {
  onText: (text: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  const voice = useVoiceAssistant();
  const id = useId();
  if (disabled || !voice.supported) return null;

  return (
    <button
      type="button"
      aria-label={label ? `Speak ${label}` : "Speak to fill this field"}
      onClick={() => {
        if (voice.listening) {
          voice.stop();
          return;
        }
        void voice.listen(onText, "auto", undefined, true);
      }}
      className={`absolute right-2.5 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition ${
        voice.listening ? "bg-[#1C1917] text-white" : "text-[#1F6B4A] hover:bg-[#E8F3EC]"
      }`}
    >
      {voice.listening ? <Square size={12} fill="currentColor" /> : <Mic size={16} />}
      <span className="sr-only">{id}</span>
    </button>
  );
}

export function MicSlot({
  children,
  onText,
  label,
  disabled,
}: {
  children: ReactNode;
  onText: (text: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <span className="relative block">
      {children}
      <FieldMic label={label} onText={onText} disabled={disabled} />
    </span>
  );
}

export function VoiceField({
  label,
  value,
  onChange,
  className = "",
  inputClassName = PREMIUM_FIELD,
  mic = true,
  prefix,
  numeric,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  mic?: boolean;
  prefix?: ReactNode;
  numeric?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className">) {
  const apply = (text: string) =>
    onChange(numeric || props.type === "tel" || props.inputMode === "numeric" ? digitsOnly(text) : text);

  return (
    <label className={`block ${className}`}>
      <span className={PREMIUM_LABEL}>{label}</span>
      <span className="relative block">
        {prefix ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-[1] flex -translate-y-1/2 items-center gap-1.5 text-[13px] font-medium text-[#5C635E]">
            {prefix}
          </span>
        ) : null}
        <input
          {...props}
          value={value}
          onChange={(event) => apply(event.target.value)}
          className={`${inputClassName} ${prefix ? "pl-[4.6rem]" : ""}`}
        />
        {mic ? (
          <FieldMic
            label={label}
            disabled={props.disabled || props.readOnly}
            onText={apply}
          />
        ) : null}
      </span>
    </label>
  );
}

export function VoiceArea({
  label,
  value,
  onChange,
  className = "",
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "className">) {
  return (
    <label className={`block ${className}`}>
      <span className={PREMIUM_LABEL}>{label}</span>
      <span className="relative block">
        <textarea
          {...props}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={PREMIUM_AREA}
        />
        <FieldMic label={label} onText={onChange} />
      </span>
    </label>
  );
}

export function VoiceSelect({
  label,
  className = "",
  children,
  ...props
}: {
  label: string;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={PREMIUM_LABEL}>{label}</span>
      <select {...props} className={PREMIUM_SELECT}>
        {children}
      </select>
    </label>
  );
}

export function SpeakAllButton({
  onParsed,
}: {
  onParsed: (parts: { name?: string; phone?: string; email?: string; rest?: string }) => void;
}) {
  const voice = useVoiceAssistant();

  return (
    <button
      type="button"
      onClick={() =>
        void voice.listen((text) => {
          const phone = text.match(/[6-9]\d{9}/)?.[0];
          const emailMatch = text
            .toLowerCase()
            .replace(/\s+at\s+/g, "@")
            .replace(/\s+dot\s+/g, ".")
            .match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
          let rest = text;
          if (phone) rest = rest.replace(phone, " ");
          if (emailMatch) {
            rest = rest.replace(
              new RegExp(emailMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
              " "
            );
          }
          const name = rest.replace(/[,.]+/g, " ").replace(/\s+/g, " ").trim();
          onParsed({
            name: name || undefined,
            phone,
            email: emailMatch?.[0],
            rest: text,
          });
        }, "auto", undefined, true)
      }
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#EAF7EF] px-4 text-[13px] font-medium text-[#146C3A]"
    >
      <Mic size={15} />
      Speak name, mobile and email in one go
    </button>
  );
}

export function ComingThroughChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className={PREMIUM_LABEL}>Coming through</p>
      <div className="flex flex-wrap gap-2">
        {COMING_THROUGH_OPTIONS.map((option) => {
          const on = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`min-h-11 rounded-full px-4 text-[13px] font-medium transition ${
                on
                  ? "bg-[#1C1917] text-white"
                  : "border border-[#E6EBE7] bg-white text-[#3F4A44] hover:border-[#1F6B4A]/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Per-field mics replaced the dock. Kept so leftover imports do not crash. */
export default function FormVoiceDock() {
  return null;
}
