"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ScrollCityRide from "./ScrollCityRide";

const partners = [
  { name: "Flipkart", color: "#2874F0" },
  { name: "Blinkit", color: "#F8C41C" },
  { name: "Zepto", color: "#FF3269" },
  { name: "Swiggy", color: "#FC8019" },
];

const hubs = [
  { label: "Hub live", x: "10%", delay: "0s" },
  { label: "In ride", x: "46%", delay: "0.8s" },
  { label: "Return", x: "78%", delay: "1.6s" },
];

const contain = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  maxWidth: "none",
  maxHeight: "none",
  objectFit: "contain" as const,
  objectPosition: "center",
};

export default function Hero() {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-40, 40], [4, -4]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-40, 40], [-6, 6]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const box = cardRef.current?.getBoundingClientRect();
    if (!box) return;
    x.set(event.clientX - box.left - box.width / 2);
    y.set(event.clientY - box.top - box.height / 2);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section
      id="home"
      className="relative overflow-x-hidden bg-[#F7FBFA]"
    >
      <style>{`
        @keyframes evuddy-poster {
          0% { transform: scale(1) translateX(0); }
          50% { transform: scale(1.04) translateX(-1%); }
          100% { transform: scale(1) translateX(0); }
        }
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
        @keyframes evuddy-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes evuddy-shine {
          0% { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(230%) skewX(-18deg); }
        }
        @keyframes evuddy-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes evuddy-ink {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .evuddy-poster { animation: evuddy-poster 16s ease-in-out infinite; }
        .evuddy-partners { animation: evuddy-partners 22s linear infinite; }
        @media (max-width: 640px) {
          .evuddy-partners { animation-duration: 14s; }
        }
        .evuddy-draw { stroke-dasharray: 900; animation: evuddy-draw 3.2s ease forwards; }
        .evuddy-dash { stroke-dasharray: 10 14; animation: evuddy-dash 1s linear infinite; }
        .evuddy-pulse { animation: evuddy-pulse 2s ease-out infinite; }
        .evuddy-shine { animation: evuddy-shine 5.5s ease-in-out infinite; }
        .evuddy-bob { animation: evuddy-bob 1.1s ease-in-out infinite; }
        @keyframes evuddy-road {
          to { background-position: 80px 0; }
        }
        .evuddy-road-scroll {
          background-image: repeating-linear-gradient(90deg, #18B368 0 18px, transparent 18px 32px);
          background-size: 80px 3px;
          animation: evuddy-road 0.7s linear infinite;
        }
        .evuddy-ink {
          background-image: linear-gradient(90deg, #18B368, #EC2A8C, #18B368);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: evuddy-ink 5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-poster, .evuddy-partners, .evuddy-draw, .evuddy-dash,
          .evuddy-pulse, .evuddy-shine, .evuddy-bob, .evuddy-ink, .evuddy-road-scroll { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(24,179,104,0.14),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(236,42,140,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-32 lg:px-10 lg:pb-16 lg:pt-36">
        <div className="flex flex-col items-center px-1 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.22em] text-slate-500 sm:text-[11px]"
          >
            SMART · ELECTRIC · MOBILITY
          </motion.p>

          <h1 className="mt-3 max-w-[16ch] text-[clamp(2.1rem,8vw,4.75rem)] font-black leading-[0.92] tracking-[-0.06em] text-[#0F172A]">
            Ride smart.
            <span className="mt-1 block italic evuddy-ink">Ride EVUDDY.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
            Book in minutes. Ride the city. Own the journey.
          </p>

          <Link href="/ride-options" className="mt-6 w-full max-w-xs sm:w-auto sm:max-w-none">
            <span className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-7 text-sm font-bold text-white shadow-[0_18px_40px_rgba(24,179,104,0.28)] sm:h-16 sm:w-auto sm:px-10 sm:text-base">
              Reserve Your EV
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </div>

        <motion.div
          style={{ perspective: 1200 }}
          className="mx-auto mt-7 w-full max-w-[1280px] sm:mt-10"
        >
          <motion.a
            ref={cardRef}
            href="/ride-options"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ rotateX, rotateY }}
            className="relative block overflow-hidden rounded-[22px] border border-white bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] sm:rounded-[36px]"
          >
            <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-[#18B368] px-2.5 py-1 text-[10px] font-bold text-white sm:right-6 sm:top-5 sm:px-3 sm:text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live in city
            </span>

            <div className="relative aspect-[1600/589] w-full overflow-hidden bg-[#F7FBFA]">
              <img
                src="/poster.png"
                alt="EVUDDY electric scooters"
                className="evuddy-poster"
                style={contain}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/15 evuddy-shine" />
            </div>
          </motion.a>
        </motion.div>

        <div className="relative mx-auto mt-4 w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-white bg-white px-3 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:mt-5 sm:rounded-[28px] sm:px-6 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Live GPS route
            </p>
            <p className="truncate text-[11px] font-bold text-[#18B368]">
              Hub → street → yard
            </p>
          </div>

          <div className="relative h-[210px] overflow-hidden rounded-[16px] bg-[#F4FAF7] sm:h-[200px] lg:h-[220px]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
            <svg
              viewBox="0 0 960 220"
              className="absolute inset-0 h-full w-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M70 130 C 210 70, 340 180, 500 110 S 760 175, 890 125"
                stroke="#D7E4DC"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                id="evuddy-route"
                className="evuddy-draw"
                d="M70 130 C 210 70, 340 180, 500 110 S 760 175, 890 125"
                stroke="#18B368"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                className="evuddy-dash"
                d="M70 130 C 210 70, 340 180, 500 110 S 760 175, 890 125"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="70" cy="130" r="8" fill="#18B368" />
              <circle cx="500" cy="110" r="7" fill="#EC2A8C" />
              <circle cx="890" cy="125" r="8" fill="#18B368" />

              <g className="evuddy-bob">
                <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#evuddy-route" />
                </animateMotion>
                <g transform="translate(-22 -18)">
                  <ellipse cx="22" cy="30" rx="16" ry="4" fill="rgba(15,23,42,0.12)" />
                  <rect x="6" y="10" width="32" height="12" rx="6" fill="#EC2A8C" />
                  <rect x="18" y="4" width="14" height="8" rx="3" fill="#0F172A" />
                  <circle cx="12" cy="24" r="5" fill="#0F172A" stroke="#18B368" strokeWidth="1.5" />
                  <circle cx="32" cy="24" r="5" fill="#0F172A" stroke="#18B368" strokeWidth="1.5" />
                </g>
              </g>
            </svg>

            {hubs.map((hub) => (
              <div
                key={hub.label}
                className="absolute top-2 sm:top-3"
                style={{ left: hub.x }}
              >
                <span
                  className="evuddy-pulse absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#18B368]/50 sm:h-3 sm:w-3"
                  style={{ animationDelay: hub.delay }}
                />
                <span className="relative text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:tracking-[0.16em]">
                  {hub.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden sm:mt-8">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px] sm:tracking-[0.28em]">
            Delivery partners
          </p>
          <div className="pointer-events-none absolute bottom-0 left-0 top-7 z-10 w-8 bg-gradient-to-r from-[#F7FBFA] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-7 z-10 w-8 bg-gradient-to-l from-[#F7FBFA] to-transparent sm:w-16" />
          <div className="mt-3 overflow-hidden sm:mt-4">
            <div className="evuddy-partners flex w-max items-center gap-4 sm:gap-5">
              {[...partners, ...partners, ...partners, ...partners].map(
                (item, index) => (
                  <span
                    key={`${item.name}-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-black tracking-wide shadow-sm sm:px-7 sm:py-3.5 sm:text-lg"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <ScrollCityRide />
      </div>
    </section>
  );
}
