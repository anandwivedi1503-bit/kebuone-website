"use client";

import { motion, useReducedMotion } from "framer-motion";

import YellowScooterImg from "../Brand/YellowScooterImg";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";

/** Web poster aligned to the fleet PDF — original print poster stays separate. */
export default function FleetPartnerDesignedPoster() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] border border-[#E4DDD2] bg-[#0B1B16] shadow-[0_24px_60px_rgba(28,25,23,0.18)]"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#1F6B4A]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[#F4C430]/30 blur-3xl" />
      <div className="grid min-h-[min(72vw,420px)] grid-cols-1 items-stretch sm:min-h-[380px] sm:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#A8E6C3]">
            {FLEET_INVESTMENT.company}
          </p>
          <p className="mt-3 font-display text-3xl font-medium leading-[1.05] tracking-tight text-white sm:text-4xl">
            Fleet partner
            <span className="mt-1 block text-[#F4C430]">investment program</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75 sm:text-[15px]">
            Own the fleet. We operate everything — hubs, riders, GPS, charging and support on the
            EVUDDY platform.
          </p>
          <ul className="mt-6 space-y-2 text-xs font-medium text-white/80 sm:text-sm">
            {[
              "Yellow EV fleet on live Indian hubs",
              "Transparent brief — download the official PDF",
              "Apply on partners form · no payment on site",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F4C430]" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6EE7A8]">
            EVUDDY · Smart electric mobility
          </p>
        </div>
        <div className="relative flex min-h-[200px] items-end justify-center bg-gradient-to-t from-[#F4C430]/15 to-transparent px-4 pb-4 pt-6 sm:min-h-0 sm:items-center sm:pb-8">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-[280px]"
          >
            <div className="absolute inset-x-8 bottom-2 h-8 rounded-full bg-black/25 blur-xl" />
            <YellowScooterImg
              variant="cutout"
              className="relative mx-auto h-[min(42vw,220px)] w-auto sm:h-[260px]"
              loading="eager"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
