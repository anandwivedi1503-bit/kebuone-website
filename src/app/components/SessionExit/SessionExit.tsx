"use client";

import { Globe, LogOut } from "lucide-react";

import { leaveToWebsite, logoutRider } from "@/lib/riderPlanGate";

type SessionExitProps = {
  compact?: boolean;
  onPicked?: () => void;
};

export default function SessionExit({ compact = false, onPicked }: SessionExitProps) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <button
        type="button"
        onClick={() => {
          onPicked?.();
          leaveToWebsite();
        }}
        className="flex items-center gap-3 rounded-2xl border border-[#E4DDD2] bg-white px-3 py-3 text-left font-semibold text-[#0F172A] transition hover:border-[#18B368]/40 hover:bg-[#F7FBF8]"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18B368]/10 text-[#18B368]">
          <Globe size={18} />
        </span>
        <span>
          <span className="block text-sm">Back to website</span>
          <span className="block text-xs font-medium text-slate-500">Stay signed in</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          onPicked?.();
          void logoutRider();
        }}
        className="flex items-center gap-3 rounded-2xl border border-[#EC2A8C]/20 bg-white px-3 py-3 text-left font-semibold text-[#EC2A8C] transition hover:bg-[#EC2A8C]/8"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EC2A8C]/10 text-[#EC2A8C]">
          <LogOut size={18} />
        </span>
        <span>
          <span className="block text-sm">Log out completely</span>
          <span className="block text-xs font-medium text-[#EC2A8C]/80">
            Booking progress is saved for next OTP
          </span>
        </span>
      </button>
    </div>
  );
}
