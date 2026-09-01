"use client";

import type { ReactNode } from "react";
import { Volume2, X } from "lucide-react";

import AssistantLogo from "@/app/components/Assistant/AssistantLogo";
import { ASSISTANT_LANGUAGES } from "@/lib/assistantLanguages";

type Props = {
  title: string;
  subtitle: string;
  liveLabel?: string;
  language: string;
  onLanguage: (value: string) => void;
  onClose: () => void;
  speakBack?: boolean;
  onSpeakBack?: () => void;
  children: ReactNode;
  footer: ReactNode;
  chips?: ReactNode;
};

export function TypingDots() {
  return (
    <div className="mr-10 inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
      <span className="h-1.5 w-1.5 animate-[assistantDot_1.2s_ease-in-out_infinite] rounded-full bg-[#18B368]" />
      <span className="h-1.5 w-1.5 animate-[assistantDot_1.2s_ease-in-out_.2s_infinite] rounded-full bg-[#18B368]" />
      <span className="h-1.5 w-1.5 animate-[assistantDot_1.2s_ease-in-out_.4s_infinite] rounded-full bg-[#18B368]" />
    </div>
  );
}

export default function AssistantShell({
  title,
  subtitle,
  liveLabel = "Online",
  language,
  onLanguage,
  onClose,
  speakBack,
  onSpeakBack,
  children,
  footer,
  chips,
}: Props) {
  return (
    <div className="pointer-events-auto flex h-[min(38rem,calc(100dvh-7.5rem))] w-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[#F4F7F5] shadow-[0_40px_120px_rgba(0,0,0,.45)] animate-[assistantPanelIn_.28s_ease] [font-family:var(--font-noto-deva),var(--font-geist-sans),sans-serif] sm:h-[min(40rem,calc(100dvh-5rem))]">
      <div className="relative shrink-0 bg-gradient-to-br from-[#0B1B16] via-[#102820] to-[#163528] px-3.5 py-3 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#18B368]/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-[#EC2A8C]/15 blur-2xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="relative shrink-0">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-lg ring-2 ring-[#18B368]/50">
              <AssistantLogo size={44} />
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1B16] bg-[#22C55E]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-[15px] font-black tracking-tight">{title}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#18B368]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7DFFB2]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />
                {liveLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-white/75">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <select
              value={language}
              onChange={(event) => onLanguage(event.target.value)}
              className="max-w-[88px] rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-bold text-white outline-none"
              aria-label="Assistant language"
            >
              {ASSISTANT_LANGUAGES.map((item) => (
                <option key={item.id} value={item.id} className="text-[#0F172A]">
                  {item.label}
                </option>
              ))}
            </select>
            {onSpeakBack ? (
              <button
                type="button"
                onClick={onSpeakBack}
                className={`rounded-full p-1.5 ${speakBack ? "bg-[#18B368]" : "bg-white/10"}`}
                aria-label="Toggle speak back"
                aria-pressed={speakBack}
              >
                <Volume2 size={15} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-1.5 hover:bg-white/20"
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 pb-4">
        {children}
      </div>
      {chips ? (
        <div className="shrink-0 border-t border-slate-200/80 bg-white/70 px-3 py-2">{chips}</div>
      ) : null}
      <div className="shrink-0 border-t border-slate-200/80 bg-white p-3">{footer}</div>
    </div>
  );
}
