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
          .evuddy-draw, .evuddy-dash, .evuddy-ink, .evuddy-gps-ring { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(245,196,0,0.28),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(236,42,140,0.16),transparent_32%),radial-gradient(circle_at_70%_90%,rgba(18,181,168,0.16),transparent_36%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-10 lg:pb-16 lg:pt-32">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#F5C400]/50 bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#7A5A00] shadow-sm sm:text-[11px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5C400]" />
              INDIA&apos;S SMART EV RENTAL
            </motion.p>

            <h1 className="mx-auto mt-4 max-w-[14ch] text-[clamp(2rem,8vw,4.4rem)] font-black leading-[0.94] tracking-[-0.06em] text-[#0F172A] lg:mx-0">
              Ride the city.
              <span className="mt-1 block italic evuddy-ink">Own the journey.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600 sm:text-base lg:mx-0">
              Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
              <span className="mt-1 block font-semibold text-[#0F766E]">
                मिनटों में बुक करें. शहर घूमें. राइड अपना बनाएँ.
              </span>
            </p>

            <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center lg:mx-0 lg:justify-start">
              <Link href="/ride-options" className="w-full sm:w-auto">
                <span className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-7 text-sm font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)] transition hover:bg-[#16a05c] active:scale-[0.98] sm:min-h-14 sm:w-auto sm:px-10 sm:text-base">
                  Book an EV
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link href="/ride-options" className="w-full sm:w-auto">
                <span className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-bold text-[#0F172A] transition hover:border-[#18B368]/40 active:scale-[0.98] sm:min-h-14 sm:w-auto sm:px-8 sm:text-base">
                  Rent to Own ₹280/day
                </span>
              </Link>
            </div>
          </div>

          <Link
            href="/ride-options"
            className="relative order-first block overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-[0_24px_50px_rgba(15,23,42,0.14)] sm:rounded-[28px] lg:order-none"
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
              className="aspect-[4/3] w-full object-cover object-[50%_58%] sm:aspect-[16/10]"
            />
          </Link>
        </div>

        <div className="relative mx-auto mt-5 w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-white bg-[#071510] px-3 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:mt-8 sm:rounded-[28px] sm:px-6 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="inline-flex min-w-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55 sm:text-[11px] sm:tracking-[0.16em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
              </span>
              Live GPS tracking
            </p>
            <p className="max-w-[55%] truncate text-right text-[10px] font-bold text-[#6EE7A8] sm:max-w-none sm:text-[11px]">
              {cityLine} · In ride
            </p>
          </div>

          <div className="relative h-[150px] overflow-hidden rounded-[16px] bg-[#0B1C16] sm:h-[220px] lg:h-[250px]">
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
                  HUB
                </text>
              </a>
              <a href={googleMapsUrl(endLat, endLng, `EVUDDY ${endLabel}`)} target="_blank" rel="noreferrer">
                <circle cx="880" cy="155" r="16" fill="#EC2A8C" opacity="0.25" />
                <circle cx="880" cy="155" r="8" fill="#EC2A8C" />
                <text x="880" y="183" textAnchor="middle" fill="#F9A8D4" fontSize="11" fontWeight="700">
                  YARD
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

        <div className="relative mt-5 sm:mt-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:tracking-[0.28em]">
            Delivery partners
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {PARTNERS.map((item) => (
              <span
                key={item.name}
                className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-white bg-white/90 px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
              >
                <span className="flex h-8 w-full items-center justify-center overflow-hidden">
                  <img
                    src={item.src}
                    alt=""
                    className="max-h-8 max-w-[104px] object-contain"
                  />
                </span>
                <span className="text-[11px] font-bold text-[#0F172A]">{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
