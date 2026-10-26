"use client";

import { MapPin, Navigation } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import YellowScooterImg from "../Brand/YellowScooterImg";
import { googleMapsUrl } from "./maps";

type Props = {
  name: string;
  lat: number;
  lng: number;
  hubLine?: string;
};

/** CSP-safe hub preview with yellow scooter GPS art (no Google iframe). */
export default function HubMapPreview({ name, lat, lng, hubLine }: Props) {
  const reduceMotion = useReducedMotion();
  const mapsHref = googleMapsUrl(lat, lng, `EVUDDY ${name}`);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E4DDD2] bg-white shadow-[0_16px_40px_rgba(28,25,23,0.06)]">
      <div className="relative h-[min(52vw,220px)] min-h-[180px] overflow-hidden bg-[#F4F0E6] sm:h-[220px]">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "linear-gradient(#E4DDD2 1px, transparent 1px), linear-gradient(90deg, #E4DDD2 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F3EC]/80 via-transparent to-[#F7F4EE]/90" />
        <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full" aria-hidden>
          <path
            id="hub-route"
            d="M40 140 C120 60, 200 170, 280 90 S 340 150, 360 110"
            fill="none"
            stroke="#1F6B4A"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.55"
          />
          <circle cx="52" cy="138" r="7" fill="#1F6B4A" />
          <circle cx="348" cy="108" r="6" fill="#1C1917" />
        </svg>
        <motion.div
          className="pointer-events-none absolute left-[42%] top-[32%] -translate-x-1/2 -translate-y-1/2"
          animate={reduceMotion ? undefined : { y: [0, -6, 0], x: [0, 4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-[min(22vw,84px)] w-[min(22vw,84px)] sm:h-[88px] sm:w-[88px]">
            <YellowScooterImg variant="cutout" className="h-full w-full" />
          </div>
        </motion.div>
        <div className="absolute left-3 top-3 max-w-[85%] rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1F6B4A] shadow-sm sm:left-4 sm:top-4 sm:text-[10px] sm:tracking-[0.14em]">
          Live GPS · Yellow scooter
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <MapPin size={16} className="shrink-0 text-[#1F6B4A]" />
            <span className="truncate">{name}</span>
          </p>
          {hubLine ? (
            <p className="mt-1 line-clamp-2 text-xs text-[#8A847A] sm:truncate">{hubLine}</p>
          ) : null}
          <p className="mt-1 text-[11px] text-[#8A847A]">
            {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c] hover:shadow-md sm:w-auto"
        >
          <Navigation size={15} />
          Google Maps
        </a>
      </div>
    </div>
  );
}
