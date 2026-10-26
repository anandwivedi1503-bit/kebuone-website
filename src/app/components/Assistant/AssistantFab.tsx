"use client";

import { MessageCircle, X } from "lucide-react";

import AssistantLogo from "@/app/components/Assistant/AssistantLogo";

type Props = {
  open: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
  tone?: "rider" | "ops";
};

/** Single floating control — logo + label in one pill (no duplicate orb + chip). */
export default function AssistantFab({
  open,
  onClick,
  label,
  ariaLabel,
  tone = "rider",
}: Props) {
  const accent = tone === "ops" ? "from-[#0B1B16] to-[#10241c]" : "from-[#1F6B4A] to-[#15803D]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={open}
      className={`pointer-events-auto group flex items-center gap-0 overflow-hidden rounded-full bg-gradient-to-r ${accent} p-1 pr-4 text-white shadow-[0_14px_40px_rgba(31,107,74,0.35)] transition hover:shadow-[0_18px_48px_rgba(31,107,74,0.42)] hover:brightness-105 active:scale-[0.98] sm:pr-5`}
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
        {open ? (
          <X size={22} strokeWidth={2.5} />
        ) : (
          <>
            <AssistantLogo size={40} priority />
            <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1F6B4A] bg-[#22C55E]" />
          </>
        )}
      </span>
      {!open ? (
        <span className="flex items-center gap-1.5 pl-2 text-sm font-semibold tracking-[0.02em]">
          <MessageCircle size={15} className="opacity-90" aria-hidden />
          {label}
        </span>
      ) : (
        <span className="pl-3 text-sm font-semibold">Close</span>
      )}
    </button>
  );
}
