"use client";

import { useEffect, useState } from "react";
import { ChevronRight, User } from "lucide-react";

import {
  getChosenPlan,
  getRiderProfile,
  hasRiderBookingLock,
  openRiderAccountMenu,
  RIDER_SESSION_EVENT,
} from "@/lib/riderPlanGate";

const planLabel = (plan: string) => {
  if (plan === "rental") return "Normal booking";
  if (plan === "rto") return "Rent to Own";
  return "Ride options";
};

export default function RiderSessionBar() {
  const [phone, setPhone] = useState("");
  const [riderId, setRiderId] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const profile = getRiderProfile();
      setPhone(profile.phone);
      setRiderId(profile.riderId);
      setName(profile.name);
      setPlan(getChosenPlan());
      setLocked(hasRiderBookingLock());
    };
    refresh();
    window.addEventListener(RIDER_SESSION_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(RIDER_SESSION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!phone && !riderId && !plan) return null;

  return (
    <button
      type="button"
      onClick={() => openRiderAccountMenu()}
      className="mx-auto mb-6 flex w-full max-w-5xl items-center gap-4 rounded-[24px] border border-white bg-white/90 p-4 text-left shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:border-[#18B368]/40"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18B368] text-white">
        <User size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">
          Your account · tap to open
        </p>
        <p className="truncate text-lg font-black text-[#0F172A]">
          {name || riderId || "Rider"} {phone ? `· +91 ${phone}` : ""}
        </p>
        <p className="text-sm text-slate-500">
          {planLabel(plan)}
          {locked ? " · Booking in progress" : ""}
        </p>
      </div>
      <ChevronRight className="shrink-0 text-[#18B368]" size={22} />
    </button>
  );
}
