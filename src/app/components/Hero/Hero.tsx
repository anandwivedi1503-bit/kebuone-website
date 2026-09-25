"use client";

import { BRAND } from "@/lib/brandMedia";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { googleMapsUrl } from "../EvuddyNetwork/maps";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";
import HomeImg from "../HomeMedia/HomeImg";
import { GpsScooterMark } from "./GpsScooter";

type LiveHub = {
  hubName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export default function Hero() {
  const { catalog } = useHomeCatalog();
  const [hubs, setHubs] = useState<LiveHub[]>([]);

  useEffect(() => {
    fetch("/api/hubs")
      .then((res) => res.json())
      .then((json) => setHubs(Array.isArray(json.data) ? json.data : []))
      .catch(() => setHubs([]));
  }, []);

  const liveHubs = hubs.filter((hub) => {
    const lat = Number(hub.latitude);
    const lng = Number(hub.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });
  const startHub = liveHubs[0];
  const endHub = liveHubs[1] || liveHubs[0];
  const startLat = Number(startHub?.latitude) || 26.8467;
  const startLng = Number(startHub?.longitude) || 80.9462;
  const endLat = Number(endHub?.latitude) || 26.8467;
  const endLng = Number(endHub?.longitude) || 80.9462;
  const startLabel = startHub?.hubName || startHub?.city || "HUB";
  const endLabel = endHub?.hubName || endHub?.city || "YARD";
  const cityLine =
    catalog.cities.length > 0
      ? catalog.cities.map((city) => city.cityName).join(" · ")
      : "Live hub";

  return (
    <section id="home" className="relative overflow-x-hidden scroll-mt-28 bg-[#F7F4EE] sm:scroll-mt-40">
      <style>{`
        @keyframes evuddy-draw {
          0% { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes evuddy-dash {
          to { stroke-dashoffset: -48; }
        }
        .evuddy-draw { stroke-dasharray: 900; animation: evuddy-draw 3.2s ease forwards; }
        .evuddy-dash { stroke-dasharray: 6 10; animation: evuddy-dash 1.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-draw, .evuddy-dash { animation: none !important; }
        }
      `}</style>

      <div className="page-under-nav mx-auto max-w-[920px] px-5 pb-4 pt-6 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
          Hub pickup · Live GPS · EV only
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,7vw,4.2rem)] font-medium leading-[1.05] tracking-[-0.04em] text-[#1C1917]">
          Where are you riding today?
        </h1>
        <div className="relative mt-7 overflow-hidden rounded-[28px] bg-[#1C1917]">
          <HomeImg
            src={BRAND.cityCommute}
            alt="EVUDDY scooter on a city road"
            priority
            className="aspect-[16/10] w-full object-cover object-center"
          />
          <Link
            href="/ride-options"
            className="absolute bottom-5 left-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] px-6 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(22,163,74,0.35)]"
          >
            Book EV
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[920px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="rounded-[24px] border border-[#E4DDD2] bg-white px-5 py-5 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
              Live GPS tracking
            </p>
            <p className="truncate text-[11px] tracking-[0.08em] text-[#1F6B4A]">{cityLine}</p>
          </div>
          <div className="relative h-[200px] overflow-hidden rounded-[18px] bg-[#F4F0E6] sm:h-[230px]">
            <svg viewBox="0 0 960 260" className="h-full w-full" fill="none" aria-label="EVUDDY scooter moving from hub to yard">
              <defs>
                <pattern id="gps-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E4DDD2" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="960" height="260" fill="url(#gps-grid)" />
              <path
                d="M80 168 C 220 78, 340 228, 500 138 S 760 218, 880 152"
                stroke="#E4DDD2"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                id="evuddy-route"
                className="evuddy-draw"
                d="M80 168 C 220 78, 340 228, 500 138 S 760 218, 880 152"
                stroke="#1F6B4A"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <a href={googleMapsUrl(startLat, startLng, `EVUDDY ${startLabel}`)} target="_blank" rel="noreferrer">
                <circle cx="80" cy="168" r="6" fill="#1F6B4A" />
                <text x="80" y="198" textAnchor="middle" fill="#5F6B63" fontSize="11" letterSpacing="1.5">
                  HUB
                </text>
              </a>
              <a href={googleMapsUrl(endLat, endLng, `EVUDDY ${endLabel}`)} target="_blank" rel="noreferrer">
                <circle cx="880" cy="152" r="6" fill="#1C1917" />
                <text x="880" y="182" textAnchor="middle" fill="#5F6B63" fontSize="11" letterSpacing="1.5">
                  YARD
                </text>
              </a>
              <g>
                <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#evuddy-route" />
                </animateMotion>
                <GpsScooterMark />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
