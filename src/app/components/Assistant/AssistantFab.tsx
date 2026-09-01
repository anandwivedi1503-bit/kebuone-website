"use client";

import { X } from "lucide-react";

import AssistantLogo from "@/app/components/Assistant/AssistantLogo";

type Props = {
  open: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
  tone?: "rider" | "ops";
};

export default function AssistantFab({
  open,
  onClick,
  label,
  ariaLabel,
  tone = "rider",
}: Props) {
  const glow =
    tone === "ops"
      ? "shadow-[0_18px_50px_rgba(11,27,22,.45)]"
      : "shadow-[0_18px_50px_rgba(24,179,104,.45)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={open}
      className={`pointer-events-auto group relative flex items-center gap-3 ${open ? "" : "animate-[assistantFabIn_.45s_ease]"}`}
    >
      {!open ? (
        <span className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-[#18B368]/25 blur-md group-hover:bg-[#18B368]/35" />
      ) : null}
      {!open ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#18B368]/35 animate-[assistantRing_2.4s_ease-out_infinite]" />
      ) : null}

      <span
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#18B368] via-[#12A35C] to-[#EC2A8C] p-[3px] transition-transform duration-200 group-hover:scale-105 active:scale-95 ${glow}`}
      >
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white p-1">
          {open ? (
            <X className="text-[#0B1B16]" size={26} strokeWidth={2.5} />
          ) : (
            <AssistantLogo size={56} priority />
          )}
        </span>
        {!open ? (
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22C55E] shadow-[0_0_0_3px_rgba(34,197,94,.25)]" />
        ) : null}
      </span>

      {!open ? (
        <span
          className={`hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-black text-white ${
            tone === "ops" ? "bg-[#0B1B16]" : "bg-[#0B1B16]/95"
          } ${glow}`}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}
