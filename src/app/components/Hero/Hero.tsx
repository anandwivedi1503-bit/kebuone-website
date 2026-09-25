"use client";

import { BRAND } from "@/lib/brandMedia";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { googleMapsUrl } from "../EvuddyNetwork/maps";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";
import HomeImg from "../HomeMedia/HomeImg";

const SLIDES = [
  { src: BRAND.cityCommute, kicker: "City commute", title: "Ride the city" },
  { src: BRAND.afterWork, kicker: "After work", title: "Home in minutes" },
  { src: BRAND.yard, kicker: "Flagship hub", title: "OTP at the yard" },
  { src: BRAND.range, kicker: "Range", title: "120 km on one ride" },
];

type LiveHub = {
  hubName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export default function Hero() {
  const { catalog } = useHomeCatalog();
  const [slide, setSlide] = useState(0);
  const [hubs, setHubs] = useState<LiveHub[]>([]);

  useEffect(() => {
    fetch("/api/hubs")
      .then((res) => res.json())
      .then((json) => setHubs(Array.isArray(json.data) ? json.data : []))
      .catch(() => setHubs([]));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
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
  const active = SLIDES[slide];

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

      <div className="page-under-nav mx-auto grid max-w-[1440px] items-center gap-8 px-5 pb-6 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:px-12">
        <div className="flex min-w-0 flex-col justify-center py-4 lg:py-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
            India&apos;s smart EV rental
          </p>
          <h1 className="font-display mt-5 text-[clamp(2.4rem,6vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#1C1917]">
            Ride the city.
            <span className="mt-1 block italic text-[#1F6B4A]">Own the journey.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5C635E] sm:text-base sm:leading-8">
            Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
            <span className="mt-2 block text-[#1F6B4A]">
              Book in minutes. Ride the city. Make the ride yours.
            </span>
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-8 text-[13px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c]">
                Book an EV
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#1C1917]/15 px-8 text-[13px] font-medium text-[#1C1917]">
                Rent to Own ₹300/day
              </span>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-[#1C1917] sm:aspect-[3/2]">
          {SLIDES.map((item, index) => {
            const prev = (slide + SLIDES.length - 1) % SLIDES.length;
            const visible = index === slide || (slide !== 0 && index === prev);
            if (!visible) return null;
            return (
              <HomeImg
                key={item.src}
                src={item.src}
                alt={item.title}
                priority={index === 0 && slide === 0}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                  index === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            );
          })}
          <Link
            href="/ride-options"
            className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#0B1B16] shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
          >
            Book EV
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm">
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-white sm:block">
              {active.kicker}
            </p>
            {SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={item.title}
                onClick={() => setSlide(index)}
                className={`h-1.5 rounded-full transition ${index === slide ? "w-5 bg-white" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-10 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[28px] border border-[#E4DDD2] bg-white">
          <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
              Live GPS tracking
            </p>
            <p className="min-w-0 max-w-[55%] truncate text-right text-[11px] leading-4 tracking-[0.08em] text-[#1F6B4A]">
              {cityLine} · In ride
            </p>
          </div>
          <div className="relative h-[220px] bg-[#F4F0E6] sm:h-[280px]">
            <svg viewBox="0 0 960 260" className="h-full w-full" fill="none" aria-label="EVUDDY rider moving from hub to yard">
              <defs>
                <pattern id="gps-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E4DDD2" strokeWidth="1" />
                </pattern>
                <clipPath id="rider-clip">
                  <circle cx="0" cy="0" r="30" />
                </clipPath>
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
              <path
                className="evuddy-dash"
                d="M80 168 C 220 78, 340 228, 500 138 S 760 218, 880 152"
                stroke="#1C1917"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.28"
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
                <animateMotion dur="12s" repeatCount="indefinite" rotate="0">
                  <mpath href="#evuddy-route" />
                </animateMotion>
                <circle r="34" fill="#F4C430" opacity="0.35" />
                <g clipPath="url(#rider-clip)">
                  <image
                    href={BRAND.cityCommute}
                    x="-32"
                    y="-32"
                    width="64"
                    height="64"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
                <circle r="30" fill="none" stroke="#F4C430" strokeWidth="3" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
