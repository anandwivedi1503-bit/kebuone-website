"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BatteryCharging,
  Headphones,
  MapPinned,
  Radio,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import YellowScooterImg from "../Brand/YellowScooterImg";

const ADVANTAGES = [
  {
    icon: Radio,
    title: "IoT on every scooter",
    line: "Live GPS, lock & battery — same feed as ops.",
  },
  {
    icon: ShieldCheck,
    title: "Yard OTP pickup",
    line: "Pay on Book EV, show OTP, ride from the hub.",
  },
  {
    icon: MapPinned,
    title: "Hub to hub",
    line: "Pick a live city & yard on the map.",
  },
  {
    icon: Wallet,
    title: "Clear pricing",
    line: "GST-inclusive plans · wallet & Razorpay.",
  },
  {
    icon: BatteryCharging,
    title: "Charge at yard",
    line: "Return to your pickup hub when done.",
  },
  {
    icon: Headphones,
    title: "24×7 helpdesk",
    line: "helpdesk@kebuone.in · +91 8726006519",
  },
] as const;

/** EVeez / Zypp-style advantage band — short copy only. */
export default function EvuddyAdvantage() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0B1B16] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,107,74,0.35),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(244,196,48,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute -right-8 top-8 hidden w-[min(42vw,380px)] opacity-90 lg:block">
        <YellowScooterImg className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A8E6C3]">
            The EVUDDY advantage
          </p>
          <h2 className="font-display mt-3 text-[clamp(1.85rem,5vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
            Yellow fleet.
            <span className="block text-[#F4C430]">Verified yards.</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/70 sm:text-[15px]">
            Built for riders and delivery partners — book in minutes, ride with OTP, return when
            rent is clear.
          </p>
          <Link
            href="/ride-options"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#1F6B4A] px-6 text-[13px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c]"
          >
            Book an EV
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:border-[#F4C430]/35 hover:bg-white/10 sm:p-5"
              >
                <Icon size={20} className="text-[#F4C430]" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-[13px] sm:leading-6">
                  {item.line}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center lg:hidden">
          <YellowScooterImg className="h-[min(40vw,200px)] w-auto" />
        </div>
      </div>
    </section>
  );
}
