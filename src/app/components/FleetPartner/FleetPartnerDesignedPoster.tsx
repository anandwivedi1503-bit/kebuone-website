"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download } from "lucide-react";

import YellowScooterImg from "../Brand/YellowScooterImg";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";

export default function FleetPartnerDesignedPoster() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[28px] border border-[#18B368]/20 bg-[#0A1134] shadow-[0_24px_56px_rgba(10,17,52,0.22)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(24,179,104,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(244,196,48,0.12),transparent_50%)]" />
      <div className="relative grid min-h-[280px] grid-cols-1 sm:min-h-[320px] sm:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#7ddea8]">
            {FLEET_INVESTMENT.company}
          </p>
          <p className="mt-3 font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-3xl">
            Fleet partner
            <span className="block text-[#F4C430]">investment</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Yellow scooters · live hubs · EVUDDY ops stack
          </p>
          <a
            href={FLEET_INVESTMENT.pdfHref}
            download={FLEET_INVESTMENT.pdfFileName}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/15"
          >
            <Download size={14} />
            Official PDF
          </a>
        </div>
        <div className="relative min-h-[200px] sm:min-h-0">
          <YellowScooterImg
            variant="ride"
            className="absolute inset-0 h-full w-full object-cover object-[center_70%] sm:object-center"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A1134] via-transparent to-transparent sm:bg-gradient-to-l sm:from-[#0A1134]/80 sm:via-transparent sm:to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
