"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEvuddySideSrc } from "./useEvuddySideSrc";
import { googleMapsUrl } from "../EvuddyNetwork/maps";

const partners = ["Flipkart", "Blinkit", "Zepto", "Swiggy"];

export default function Hero() {
  const bikeSrc = useEvuddySideSrc();
  const scooter = bikeSrc || "/evuddy-scooter-cutout.png";

  return (
    <section id="home" className="relative overflow-hidden bg-[#06140F] text-white">
      <style>{`
        @keyframes evuddy-partners {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes evuddy-draw {
          0% { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes evuddy-dash { to { stroke-dashoffset: -120; } }
        @keyframes evuddy-gps-ring {
          0% { transform: scale(0.55); opacity: 0.65; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes evuddy-poster {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .evuddy-partners { animation: evuddy-partners 28s linear infinite; }
        .evuddy-draw { stroke-dasharray: 900; animation: evuddy-draw 3.2s ease forwards; }
        .evuddy-dash { stroke-dasharray: 10 14; animation: evuddy-dash 1s linear infinite; }
        .evuddy-gps-ring { animation: evuddy-gps-ring 1.6s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        .evuddy-poster { animation: evuddy-poster 22s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-partners, .evuddy-draw, .evuddy-dash, .evuddy-gps-ring, .evuddy-poster { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(24,179,104,0.22),transparent_42%),radial-gradient(ellipse_at_10%_0%,rgba(236,42,140,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1440px] items-end gap-8 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:px-12 lg:pb-16 lg:pt-32">
        <div className="relative z-10 max-w-xl">
          <p className="ev-kicker">India&apos;s smart EV rental</p>
          <h1 className="ev-display mt-5 text-[clamp(3.1rem,8vw,6.4rem)] leading-[0.88] text-white">
            Ride the city.
            <span className="mt-2 block italic text-[#18B368]">Own the journey.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-white/65 sm:text-base">
            Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
            <span className="mt-2 block text-white/80">
              मिनटों में बुक करें. शहर घूमें. राइड अपना बनाएँ.
            </span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/ride-options" className="ev-cta">
              Book an EV
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/ride-options" className="ev-cta-ghost">
              Rent to Own ₹280/day
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[280px] items-end justify-center sm:min-h-[420px]">
          <div className="pointer-events-none absolute bottom-[8%] h-[55%] w-[80%] rounded-full bg-[#18B368]/25 blur-[90px]" />
          <motion.img
            src={scooter}
            alt="EVUDDY electric scooter"
            className="relative z-10 w-[min(92%,640px)] max-w-none object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Link href="/ride-options" className="group relative block">
          <div className="relative aspect-[16/7] min-h-[220px] w-full overflow-hidden sm:min-h-[320px]">
            <img
              src="/poster.png"
              alt="EVUDDY electric scooters"
              className="evuddy-poster absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06140F] via-[#06140F]/55 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end px-5 pb-8 sm:px-12 sm:pb-12">
              <p className="ev-kicker">The fleet</p>
              <p className="ev-display mt-3 text-4xl text-white sm:text-6xl">
                Ride smart.
                <span className="italic text-[#18B368]"> Ride EVUDDY.</span>
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="ev-kicker">Live GPS</p>
            <p className="ev-display mt-2 text-3xl text-white sm:text-4xl">Hub to yard. On the scooter.</p>
          </div>
          <p className="hidden text-xs tracking-[0.2em] text-[#6EE7A8] sm:block">12.97°N · IN RIDE</p>
        </div>
        <div className="relative mt-6 h-[140px] overflow-hidden border-y border-white/10 sm:h-[180px]">
          <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(110,231,168,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,168,0.35)_1px,transparent_1px)] [background-size:40px_40px]" />
          <svg viewBox="0 0 960 180" className="absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="evuddy-gps-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M80 100 C 220 40, 340 140, 500 80 S 760 130, 880 90" stroke="#16352c" strokeWidth="14" strokeLinecap="round" />
            <path
              id="evuddy-route"
              className="evuddy-draw"
              d="M80 100 C 220 40, 340 140, 500 80 S 760 130, 880 90"
              stroke="#18B368"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#evuddy-gps-glow)"
            />
            <path className="evuddy-dash" d="M80 100 C 220 40, 340 140, 500 80 S 760 130, 880 90" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <a href={googleMapsUrl(27.4924, 77.6737, "EVUDDY Hub Mathura")} target="_blank" rel="noreferrer">
              <circle cx="80" cy="100" r="6" fill="#18B368" />
              <text x="80" y="128" textAnchor="middle" fill="#6EE7A8" fontSize="11">HUB</text>
            </a>
            <a href={googleMapsUrl(26.8467, 80.9462, "EVUDDY Yard Lucknow")} target="_blank" rel="noreferrer">
              <circle cx="880" cy="90" r="6" fill="#18B368" />
              <text x="880" y="118" textAnchor="middle" fill="#6EE7A8" fontSize="11">YARD</text>
            </a>
            <g>
              <animateMotion dur="8s" repeatCount="indefinite" rotate="0">
                <mpath href="#evuddy-route" />
              </animateMotion>
              <circle className="evuddy-gps-ring hidden sm:inline" r="28" fill="none" stroke="#6EE7A8" strokeWidth="1.5" />
              <image href={scooter} x="-48" y="-28" width="96" height="52" preserveAspectRatio="xMidYMid meet" />
            </g>
          </svg>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6">
        <p className="px-5 text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-white/35">
          Delivery partners
        </p>
        <div className="mt-4 overflow-hidden">
          <div className="evuddy-partners flex w-max gap-12 px-8 text-lg tracking-[0.18em] text-white/55 sm:text-xl">
            {[...partners, ...partners, ...partners, ...partners].map((name, i) => (
              <span key={`${name}-${i}`}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
