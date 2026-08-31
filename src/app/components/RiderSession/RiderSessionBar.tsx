"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

import {
  getChosenPlan,
  getRiderProfile,
  hasRiderBookingLock,
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
  const [plan, setPlan] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const profile = getRiderProfile();
      setPhone(profile.phone);
      setRiderId(profile.riderId);
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
    <div className="mx-auto mb-6 max-w-5xl rounded-[24px] border border-white bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18B368] text-white">
          <User size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">
            Your ride dashboard
          </p>
          <p className="truncate text-lg font-black text-[#0F172A]">
            {riderId || "Rider"} {phone ? `· +91 ${phone}` : ""}
          </p>
          <p className="text-sm text-slate-500">
            {planLabel(plan)}
            {locked ? " · Payment / booking in progress — other offers are paused." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
