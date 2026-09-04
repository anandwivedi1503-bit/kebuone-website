"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bike,
  ChevronDown,
  HelpCircle,
  LogOut,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { firebaseAuth } from "@/lib/firebase";
import {
  getChosenPlan,
  getRiderProfile,
  hasRiderPlanReady,
  logoutRider,
  openRiderAccountMenu,
  riderResumeHref,
  RIDER_ACCOUNT_OPEN_EVENT,
  RIDER_SESSION_EVENT,
} from "@/lib/riderPlanGate";

const planLabel = (plan: string) => {
  if (plan === "rental") return "Normal booking";
  if (plan === "rto") return "Rent to Own";
  return "Verified rider";
};

const initialsFrom = (name: string, riderId: string, phone: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  if (riderId) return riderId.replace(/\D/g, "").slice(-2) || "EV";
  if (phone) return phone.slice(-2);
  return "EV";
};

type RiderAccountMenuProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

export default function RiderAccountMenu({
  compact = false,
  onNavigate,
}: RiderAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [riderId, setRiderId] = useState("");
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [resumeHref, setResumeHref] = useState("/ride-options");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      const profile = getRiderProfile();
      const signedIn = Boolean(!firebaseAuth || firebaseAuth.currentUser);
      setPhone(profile.phone);
      setRiderId(profile.riderId);
      setName(profile.name);
      setPlan(getChosenPlan());
      setResumeHref(riderResumeHref());
      setPlanReady(
        signedIn &&
          hasRiderPlanReady() &&
          Boolean(profile.phone || profile.riderId)
      );
    };
    refresh();
    const unsubscribe = firebaseAuth
      ? onAuthStateChanged(firebaseAuth, () => refresh())
      : () => {};
    window.addEventListener(RIDER_SESSION_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const openMenu = () => setOpen(true);
    window.addEventListener(RIDER_ACCOUNT_OPEN_EVENT, openMenu);
    return () => {
      unsubscribe();
      window.removeEventListener(RIDER_SESSION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(RIDER_ACCOUNT_OPEN_EVENT, openMenu);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!planReady) return null;

  const displayName = name || riderId || (phone ? `+91 ${phone}` : "Rider");
  const initials = initialsFrom(name, riderId, phone);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full border border-[#18B368]/25 bg-white text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:border-[#18B368] ${
          compact ? "h-11 pl-1 pr-2" : "h-12 pl-1 pr-3"
        }`}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#18B368] text-xs font-black text-white">
          {initials}
        </span>
        {!compact && (
          <span className="hidden max-w-[140px] truncate text-left xl:block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#18B368]">
              Account
            </span>
          <span className="block truncate text-sm font-black">{displayName}</span>
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-[1200] mt-3 w-[min(92vw,340px)] overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
          >
            <div className="bg-[#0B1B16] px-5 py-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6EE7A8]">
                Rider profile
              </p>
              <p className="mt-2 truncate text-xl font-black">{displayName}</p>
              {riderId ? <p className="mt-1 text-sm text-white/70">{riderId}</p> : null}
              {phone ? (
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/80">
                  <Phone size={14} /> +91 {phone}
                </p>
              ) : null}
              <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                {planLabel(plan)}
              </p>
            </div>

            <div className="p-3">
              <Link
                href={resumeHref}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-[#0F172A] hover:bg-[#F7FBF8]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18B368] text-white">
                  <Bike size={18} />
                </span>
                Continue my ride
              </Link>
              <Link
                href="/contact"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-[#0F172A] hover:bg-[#F7FBF8]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-[#0F172A]">
                  <HelpCircle size={18} />
                </span>
                Help & support
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void logoutRider();
                }}
                className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 font-bold text-[#EC2A8C] hover:bg-[#EC2A8C]/8"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EC2A8C]/10 text-[#EC2A8C]">
                  <LogOut size={18} />
                </span>
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RiderAccountTriggerButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => openRiderAccountMenu()} className={className}>
      {children}
    </button>
  );
}
