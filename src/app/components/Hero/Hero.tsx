"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { googleMapsUrl } from "../EvuddyNetwork/maps";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

const PARTNERS = [
  { name: "Flipkart", src: "/partners/flipkart.png" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.jpg" },
];

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
    <section id="home" className="relative overflow-x-hidden bg-[#FFF8EE]">
      <style>{`
        @keyframes evuddy-partners {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes evuddy-draw {
          0% { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes evuddy-dash {
          to { stroke-dashoffset: -120; }
        }
        @keyframes evuddy-ink {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .evuddy-partners { animation: evuddy-partners 28s linear infinite; }
        .evuddy-draw { stroke-dasharray: 900; animation: evuddy-draw 3.2s ease forwards; }
        .evuddy-dash { stroke-dasharray: 10 14; animation: evuddy-dash 1s linear infinite; }
        .evuddy-ink {
          background-image: linear-gradient(90deg, #18B368, #12B5A8, #EC2A8C);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: evuddy-ink 5s linear infinite;
        }
        @keyframes evuddy-gps-ring {
          0% { transform: scale(0.55); opacity: 0.65; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .evuddy-gps-ring { animation: evuddy-gps-ring 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-partners, .evuddy-draw, .evuddy-dash, .evuddy-ink, .evuddy-gps-ring { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(245,196,0,0.28),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(236,42,140,0.16),transparent_32%),radial-gradient(circle_at_70%_90%,rgba(18,181,168,0.16),transparent_36%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-32 lg:px-10 lg:pb-16 lg:pt-36">
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#F5C400]/50 bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#7A5A00] shadow-sm sm:text-[11px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5C400]" />
              INDIA&apos;S SMART EV RENTAL
            </motion.p>

            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.2rem,6vw,4.4rem)] font-black leading-[0.92] tracking-[-0.06em] text-[#0F172A]">
              Ride the city.
              <span className="mt-1 block italic evuddy-ink">Own the journey.</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
              <span className="mt-1 block font-semibold text-[#0F766E]">
                मिनटों में बुक करें. शहर घूमें. राइड अपना बनाएँ.
              </span>
            </p>

            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
              <Link href="/ride-options" className="w-full sm:w-auto">
                <span className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-7 text-sm font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)] sm:h-14 sm:px-10 sm:text-base">
                  Book an EV
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link href="/ride-options" className="w-full sm:w-auto">
                <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-bold text-[#0F172A] sm:h-14 sm:px-8 sm:text-base">
                  Rent to Own ₹280/day
                </span>
              </Link>
            </div>
          </div>

          <Link
            href="/ride-options"
            className="relative block overflow-hidden rounded-[28px] border-[6px] border-white bg-white shadow-[0_30px_70px_rgba(15,23,42,0.16)]"
          >
            <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-[#EC2A8C] px-2.5 py-1 text-[10px] font-bold text-white sm:right-5 sm:top-5 sm:px-3 sm:text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live in city
            </span>
            <img
              src="/new-vehicle.jpeg"
              alt="EVUDDY electric scooter"
              className="aspect-[16/10] w-full object-cover object-[50%_62%]"
            />
          </Link>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-white bg-[#071510] px-3 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:mt-8 sm:rounded-[28px] sm:px-6 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
              </span>
              Live GPS tracking
            </p>
            <p className="truncate text-[11px] font-bold text-[#6EE7A8]">{cityLine} · In ride</p>
          </div>

          <div className="relative h-[190px] overflow-hidden rounded-[16px] bg-[#0B1C16] sm:h-[240px] lg:h-[260px]">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(110,231,168,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,168,0.22)_1px,transparent_1px)] [background-size:32px_32px]" />
            <svg
              viewBox="0 0 960 300"
              className="absolute inset-0 h-full w-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="evuddy-gps-line" x1="80" y1="170" x2="880" y2="155" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#18B368" />
                  <stop offset="0.5" stopColor="#F5C400" />
                  <stop offset="1" stopColor="#EC2A8C" />
                </linearGradient>
                <filter id="evuddy-gps-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M80 170 C 220 90, 340 230, 500 140 S 760 220, 880 155"
                stroke="#16352c"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                id="evuddy-route"
                className="evuddy-draw"
                d="M80 170 C 220 90, 340 230, 500 140 S 760 220, 880 155"
                stroke="url(#evuddy-gps-line)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#evuddy-gps-glow)"
              />
              <path
                className="evuddy-dash"
                d="M80 170 C 220 90, 340 230, 500 140 S 760 220, 880 155"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <a href={googleMapsUrl(startLat, startLng, `EVUDDY ${startLabel}`)} target="_blank" rel="noreferrer">
                <circle cx="80" cy="170" r="16" fill="#18B368" opacity="0.25" />
                <circle cx="80" cy="170" r="8" fill="#18B368" />
                <text x="80" y="198" textAnchor="middle" fill="#6EE7A8" fontSize="11" fontWeight="700">
                  {startLabel.slice(0, 12)}
                </text>
              </a>
              <a href={googleMapsUrl(endLat, endLng, `EVUDDY ${endLabel}`)} target="_blank" rel="noreferrer">
                <circle cx="880" cy="155" r="16" fill="#EC2A8C" opacity="0.25" />
                <circle cx="880" cy="155" r="8" fill="#EC2A8C" />
                <text x="880" y="183" textAnchor="middle" fill="#F9A8D4" fontSize="11" fontWeight="700">
                  {endLabel.slice(0, 12)}
                </text>
              </a>

              <g>
                <animateMotion dur="8s" repeatCount="indefinite" rotate="0">
                  <mpath href="#evuddy-route" />
                </animateMotion>
                <circle className="evuddy-gps-ring hidden sm:inline" r="28" fill="none" stroke="#F5C400" strokeWidth="2" />
                <circle r="16" fill="#18B368" opacity="0.2" />
                <circle r="5" fill="#F5C400" />
              </g>
            </svg>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden sm:mt-8">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px] sm:tracking-[0.28em]">
            Delivery partners
          </p>
          <div className="pointer-events-none absolute bottom-0 left-0 top-7 z-10 w-8 bg-gradient-to-r from-[#FFF8EE] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-7 z-10 w-8 bg-gradient-to-l from-[#FFF8EE] to-transparent sm:w-16" />
          <div className="mt-3 overflow-hidden sm:mt-4">
            <div className="evuddy-partners flex w-max items-center gap-4 sm:gap-5">
              {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((item, index) => (
                <span
                  key={`${item.name}-${index}`}
                  className="inline-flex h-16 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 shadow-sm"
                >
                  <img src={item.src} alt={item.name} className="h-8 w-auto max-w-[120px] object-contain" />
                  <span className="text-sm font-bold text-[#0F172A]">{item.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
