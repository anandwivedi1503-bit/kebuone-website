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
    kicker: "Book",
    title: "Your EVUDDY is reserved.",
    text: "Pick a hub and a plan. The scooter is charged and waiting.",
  },
  {
    kicker: "Pickup",
    title: "Collect it at the hub.",
    text: "Show your OTP, roll out, and GPS stays live from the first metre.",
  },
  {
    kicker: "Ride",
    title: "The city is the route.",
    text: "A quiet electric commute through everyday streets — not a swap station loop.",
  },
  {
    kicker: "Return",
    title: "Back to the yard.",
    text: "Ride done. Drop it at the hub. Next rider gets a full charge.",
  },
];

const blocks = [
  { h: 52, c: "#E8F4EE" },
  { h: 78, c: "#F4FBFF" },
  { h: 60, c: "#FFFFFF" },
  { h: 90, c: "#EAF6F0" },
  { h: 48, c: "#F7FBFA" },
  { h: 72, c: "#E8F1F7" },
  { h: 84, c: "#FFFFFF" },
  { h: 56, c: "#EAF6F0" },
  { h: 68, c: "#F4FBFF" },
  { h: 88, c: "#FFFFFF" },
  { h: 50, c: "#E8F4EE" },
  { h: 76, c: "#F7FBFA" },
  { h: 62, c: "#E8F1F7" },
  { h: 82, c: "#FFFFFF" },
  { h: 54, c: "#EAF6F0" },
  { h: 70, c: "#F4FBFF" },
  { h: 92, c: "#FFFFFF" },
  { h: 58, c: "#E8F4EE" },
];

export default function HeroCityRide() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const worldX = useTransform(scrollYProgress, [0, 1], ["8%", "-58%"]);
  const cloudX = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < 0.22) setBeat(0);
    else if (value < 0.48) setBeat(1);
    else if (value < 0.74) setBeat(2);
    else setBeat(3);
  });

  return (
    <div ref={ref} className="relative left-1/2 mt-6 h-[260vh] w-screen -translate-x-1/2 sm:mt-8 sm:h-[280vh]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -90px 0; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(
            90deg,
            #ffffff 0 28px,
            transparent 28px 56px
          );
          animation: evuddy-drive 0.45s linear infinite;
        }
        .evuddy-city-bike {
          width: min(58vw, 320px);
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 18px 22px rgba(15,23,42,0.16));
        }
        @media (max-width: 640px) {
          .evuddy-city-bike { width: min(72vw, 230px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-[4.6rem] flex h-[calc(100svh-5rem)] items-center px-4 sm:top-24 sm:h-[72vh] sm:px-6 lg:px-10">
        <div className="relative mx-auto h-full w-full max-w-[1440px] overflow-hidden rounded-[22px] border border-white bg-[#EAF6FF] shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:rounded-[32px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#BFE4FF_0%,#EAF6FF_36%,#F7FBFA_62%,#DDE8E2_100%)]" />
          <div className="pointer-events-none absolute right-[14%] top-8 h-14 w-14 rounded-full bg-[#FFE08A] shadow-[0_0_40px_rgba(255,224,138,0.8)] sm:h-16 sm:w-16" />

          <motion.div className="pointer-events-none absolute inset-x-0 top-10 h-12" style={{ x: cloudX }}>
            <div className="absolute left-[12%] h-7 w-24 rounded-full bg-white/80" />
            <div className="absolute left-[40%] top-2 h-9 w-32 rounded-full bg-white/70" />
            <div className="absolute left-[68%] h-6 w-20 rounded-full bg-white/75" />
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 flex h-[62%] w-[280%] sm:h-[66%]"
            style={{ x: worldX }}
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-x-0 bottom-[34%] top-0 flex items-end gap-3 px-8">
                <div className="relative mb-0 w-36 shrink-0 self-end sm:w-48">
                  <div className="h-28 rounded-t-[18px] border border-white bg-white shadow-[0_10px_24px_rgba(24,179,104,0.12)] sm:h-32">
                    <div className="mx-4 mt-4 h-2 rounded-full bg-[#18B368]" />
                    <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#18B368]">
                      EVUDDY Hub
                    </p>
                  </div>
                </div>

                {blocks.map((b, i) => (
                  <div
                    key={i}
                    className="relative min-w-[52px] flex-1 overflow-hidden rounded-t-[8px] border border-white/90 sm:min-w-[70px]"
                    style={{ height: `${b.h}%`, background: b.c }}
                  >
                    <div
                      className="absolute inset-x-[16%] top-[14%] bottom-[16%] opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(15,23,42,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.12) 1px, transparent 1px)",
                        backgroundSize: "12px 14px",
                      }}
                    />
                    {i % 5 === 0 ? (
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#18B368]" />
                    ) : null}
                  </div>
                ))}

                <div className="relative mb-0 w-32 shrink-0 self-end sm:w-40">
                  <div className="h-24 rounded-t-[16px] border border-white bg-white sm:h-28">
                    <p className="pt-10 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Yard
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#C5D0C9]">
                <div className="absolute inset-x-0 top-0 h-[72%] bg-[#B7C2BB]" />
                <div className="evuddy-drive absolute inset-x-8 top-[34%] h-[5px] rounded-full" />
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-[18%] left-1/2 z-20 -translate-x-1/2">
            <img
              src="/evuddy-scooter.png"
              alt="EVUDDY electric scooter"
              className="evuddy-city-bike"
            />
          </div>

          <div className="absolute left-3 top-3 z-30 max-w-[82%] rounded-2xl border border-white/80 bg-white/90 px-3 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:left-5 sm:top-5 sm:max-w-sm sm:px-5 sm:py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
              {beats[beat].kicker}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#0F172A] sm:text-2xl">
              {beats[beat].title}
            </h2>
            <p className="mt-1 hidden text-sm leading-6 text-slate-500 sm:block">
              {beats[beat].text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
