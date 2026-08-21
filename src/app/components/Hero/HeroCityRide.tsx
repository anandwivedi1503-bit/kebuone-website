"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

const beats = [
  {
    kicker: "01  Book",
    title: "Your EVUDDY is reserved.",
    text: "Pick a hub and a plan. The scooter is charged and waiting.",
  },
  {
    kicker: "02  Pickup",
    title: "Collect it at the hub.",
    text: "Show your OTP and roll out. GPS stays live from the first metre.",
  },
  {
    kicker: "03  Ride",
    title: "Quiet power on the street.",
    text: "A clean electric commute through the city — built for everyday work.",
  },
  {
    kicker: "04  Return",
    title: "Back when you are done.",
    text: "Drop it at the hub. The next rider gets a full charge.",
  },
];

const far = [38, 56, 44, 70, 40, 62, 48, 74, 42, 58, 50, 68, 36, 60, 46, 72, 40, 54];
const near = [58, 82, 64, 94, 54, 78, 70, 90, 60, 84, 66, 88, 52, 76, 72, 92, 58, 80];

function Building({
  height,
  shade,
}: {
  height: number;
  shade: string;
}) {
  return (
    <div
      className="relative min-w-[58px] flex-1 overflow-hidden rounded-t-[4px] sm:min-w-[78px]"
      style={{
        height: `${height}%`,
        background: shade,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.65)",
      }}
    >
      <div
        className="absolute inset-x-[18%] top-[12%] bottom-[14%] opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(#0F172A22 8px, transparent 8px), linear-gradient(90deg, #0F172A22 8px, transparent 8px)",
          backgroundSize: "14px 16px",
        }}
      />
    </div>
  );
}

export default function HeroCityRide() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const farX = useTransform(scrollYProgress, [0, 1], ["6%", "-28%"]);
  const nearX = useTransform(scrollYProgress, [0, 1], ["10%", "-62%"]);
  const roadX = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const cloudX = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < 0.22) setBeat(0);
    else if (value < 0.48) setBeat(1);
    else if (value < 0.74) setBeat(2);
    else setBeat(3);
  });

  return (
    <div ref={ref} className="relative left-1/2 mt-8 h-[280vh] w-screen -translate-x-1/2 sm:mt-10 sm:h-[300vh]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -120px 0; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.95) 0 34px,
            transparent 34px 68px
          );
          animation: evuddy-drive 0.4s linear infinite;
        }
        .evuddy-city-bike {
          width: min(62vw, 380px);
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 20px 18px rgba(15,23,42,0.18));
        }
        @media (max-width: 640px) {
          .evuddy-city-bike { width: min(78vw, 250px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-[4.5rem] h-[calc(100svh-4.5rem)] overflow-hidden bg-[#D9EEFF] sm:top-20 sm:h-[calc(100svh-5rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#9FD4FF_0%,#D9EEFF_34%,#F3FAF6_58%,#D5E3DA_100%)]" />
        <div className="pointer-events-none absolute right-[12%] top-10 h-16 w-16 rounded-full bg-[#FFE08A] sm:h-[4.5rem] sm:w-[4.5rem]" />

        <motion.div className="pointer-events-none absolute inset-x-0 top-12 h-14" style={{ x: cloudX }}>
          <div className="absolute left-[10%] h-8 w-28 rounded-full bg-white/80" />
          <div className="absolute left-[38%] top-3 h-10 w-40 rounded-full bg-white/70" />
          <div className="absolute left-[66%] h-7 w-24 rounded-full bg-white/75" />
        </motion.div>

        <div className="absolute left-5 top-6 z-30 max-w-[18rem] sm:left-10 sm:top-10 sm:max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#15803D]">
            {beats[beat].kicker}
          </p>
          <h2 className="mt-2 text-[1.7rem] font-black leading-[0.95] tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            {beats[beat].title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {beats[beat].text}
          </p>
        </div>

        <motion.div
          className="absolute bottom-[31%] left-0 flex h-[28%] w-[180%] items-end gap-2 px-6 opacity-70"
          style={{ x: farX }}
        >
          {far.map((h, i) => (
            <Building
              key={`f-${i}`}
              height={h}
              shade={i % 2 === 0 ? "#C5D8E6" : "#D2E0D8"}
            />
          ))}
        </motion.div>

        <motion.div
          className="absolute bottom-[27%] left-0 flex h-[40%] w-[260%] items-end gap-3 px-8"
          style={{ x: nearX }}
        >
          <div className="relative w-40 shrink-0 self-end sm:w-52">
            <div className="h-32 rounded-t-[20px] bg-white shadow-[0_12px_24px_rgba(15,23,42,0.08)] sm:h-36">
              <div className="mx-5 mt-5 h-2 rounded-full bg-[#18B368]" />
              <p className="mt-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#18B368]">
                EVUDDY Hub
              </p>
            </div>
          </div>
          {near.map((h, i) => (
            <Building
              key={`n-${i}`}
              height={h}
              shade={i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#E7F5EE" : "#EEF6FB"}
            />
          ))}
          <div className="relative w-36 shrink-0 self-end sm:w-44">
            <div className="h-28 rounded-t-[18px] bg-white sm:h-32">
              <p className="pt-12 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Yard
              </p>
            </div>
          </div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-[28%] sm:h-[27%]">
          <div
            className="absolute left-1/2 top-0 h-full w-[160%] -translate-x-1/2"
            style={{
              clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)",
              background: "linear-gradient(180deg,#C9D2D4 0%,#A8B2B6 55%,#8E989C 100%)",
            }}
          />
          <motion.div
            className="evuddy-drive absolute left-[22%] right-[22%] top-[38%] h-[6px] rounded-full"
            style={{ x: roadX }}
          />
        </div>

        <div className="absolute bottom-[9%] left-1/2 z-20 -translate-x-[46%] sm:bottom-[8%]">
          <img
            src="/evuddy-scooter.png"
            alt="EVUDDY electric scooter"
            className="evuddy-city-bike"
          />
        </div>
      </div>
    </div>
  );
}
