"use client";

import {
  Bike,
  CalendarDays,
  Headphones,
  KeyRound,
  UserCheck,
  Wallet,
} from "lucide-react";

const SHORTCUTS = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "kyc", label: "KYC queue", icon: UserCheck },
  { id: "support", label: "Support", icon: Headphones },
  { id: "fleet", label: "Fleet", icon: Bike },
  { id: "renttoown", label: "Rent to Own", icon: KeyRound },
  { id: "wallet", label: "Wallet", icon: Wallet },
] as const;

export default function OpsDeskRibbon({
  onOpen,
  allowedIds,
}: {
  onOpen: (dashboard: string) => void;
  allowedIds: string[] | null;
}) {
  const visible = SHORTCUTS.filter(
    (item) => !allowedIds || allowedIds.includes(item.id)
  );

  return (
    <div className="no-print mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {visible.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E4DDD2] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1917] shadow-sm transition hover:border-[#1F6B4A]/40 hover:bg-[#F7FBF8] active:scale-[0.98]"
          >
            <Icon size={14} className="text-[#1F6B4A]" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
