"use client";

import { MapPin, Navigation } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { GpsScooterMark } from "../Hero/GpsScooter";
import { googleMapsUrl } from "./maps";

type Props = {
  name: string;
  lat: number;
  lng: number;
  hubLine?: string;
};

/** CSP-safe hub preview — no Google iframe (maps.google.com was blocked by frame-src). */
export default function HubMapPreview({ name, lat, lng, hubLine }: Props) {
  const reduceMotion = useReducedMotion();
  const mapsHref = googleMapsUrl(lat, lng, `EVUDDY ${name}`);

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E4DDD2] bg-white shadow-[0_16px_40px_rgba(28,25,23,0.06)]">
      <div className="relative h-[200px] overflow-hidden bg-[#F4F0E6] sm:h-[220px]">
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
            d="M40 140 C120 60, 200 170, 280 90 S 340 150, 360 110"
            fill="none"
            stroke="#1F6B4A"
            strokeWidth="2"
            strokeDasharray="6 8"
            opacity="0.55"
          />
          <motion.g
            animate={reduceMotion ? undefined : { x: [0, 4, 0], y: [0, -2, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <g transform="translate(188 78) scale(1.15)">
              <GpsScooterMark />
            </g>
          </motion.g>
          <circle cx="52" cy="138" r="7" fill="#1F6B4A" />
          <circle cx="348" cy="108" r="6" fill="#1C1917" />
        </svg>
        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1F6B4A] shadow-sm">
          Live GPS · Yellow fleet
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
            <MapPin size={16} className="shrink-0 text-[#1F6B4A]" />
            {name}
          </p>
          {hubLine ? <p className="mt-1 truncate text-xs text-[#8A847A]">{hubLine}</p> : null}
          <p className="mt-1 text-[11px] text-[#8A847A]">
            {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c] hover:shadow-md"
        >
          <Navigation size={15} />
          Google Maps
        </a>
      </div>
    </div>
  );
}
