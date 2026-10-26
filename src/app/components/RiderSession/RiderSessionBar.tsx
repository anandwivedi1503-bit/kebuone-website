"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ChevronRight, User } from "lucide-react";

import { firebaseAuth } from "@/lib/firebase";
import {
  clearRiderBookingLock,
  getChosenPlan,
  getRiderProfile,
  hasRiderBookingLock,
  hasRiderPlanReady,
  shouldAutoResumeOpenBooking,
  openRiderAccountMenu,
  RIDER_SESSION_EVENT,
} from "@/lib/riderPlanGate";

const planLabel = (plan: string, live: boolean) => {
  if (live) {
    if (plan === "rto") return "Rent to Own · Booking in progress";
    if (plan === "rental") return "Normal booking · Booking in progress";
    return "Booking in progress";
  }
  if (plan === "rental") return "Normal booking · Ready to book";
  if (plan === "rto") return "Rent to Own · Ready to book";
  return "Signed in · Ready to book";
};

export default function RiderSessionBar() {
  const [phone, setPhone] = useState("");
  const [riderId, setRiderId] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [locked, setLocked] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const profile = getRiderProfile();
      setPhone(profile.phone);
      setRiderId(profile.riderId);
      setName(profile.name);
      setPlan(getChosenPlan());
      setPlanReady(hasRiderPlanReady());
    };

    const syncLiveBooking = async () => {
      refresh();
      try {
        const token = await firebaseAuth?.currentUser?.getIdToken();
        if (!token) {
          setLocked(false);
          return;
        }
        const res = await fetch("/api/bookings/mine", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        const live = Boolean(json.success && shouldAutoResumeOpenBooking(json.data));
        setLocked(live);
        if (!live && hasRiderBookingLock()) clearRiderBookingLock();
      } catch {
        setLocked(false);
      }
    };

    void syncLiveBooking();
    const unsubscribe = firebaseAuth
      ? onAuthStateChanged(firebaseAuth, () => {
          void syncLiveBooking();
        })
      : () => {};
    window.addEventListener(RIDER_SESSION_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const timer = window.setInterval(() => void syncLiveBooking(), 15000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener(RIDER_SESSION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!planReady) return null;

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
        <p className="text-sm text-slate-500">{planLabel(plan, locked)}</p>
      </div>
      <ChevronRight className="shrink-0 text-[#18B368]" size={22} />
    </button>
  );
}
