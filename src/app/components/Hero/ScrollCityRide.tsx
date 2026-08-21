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
    kicker: "01 · Hub",
    title: "Charged. Ready. Yours.",
    text: "The EVUDDY scooter leaves the yard at full charge — GPS live, range locked in.",
  },
  {
    kicker: "02 · City",
    title: "Quiet power on the street.",
    text: "A silent electric ride through the city. Live tracking on every turn.",
  },
  {
    kicker: "03 · Route",
    title: "Open road. Full control.",
    text: "A clean daylight route with live GPS on every kilometre.",
  },
  {
    kicker: "04 · Return",
    title: "Home. Charge. Repeat.",
    text: "Ride done. The scooter returns to the yard and charges for the next rider.",
  },
];

const skyline = [
  { h: 46, tone: "a" },
  { h: 72, tone: "b" },
  { h: 54, tone: "c" },
  { h: 88, tone: "a" },
  { h: 50, tone: "b" },
  { h: 76, tone: "c" },
  { h: 62, tone: "a" },
  { h: 92, tone: "b" },
  { h: 48, tone: "c" },
  { h: 70, tone: "a" },
  { h: 58, tone: "b" },
  { h: 84, tone: "c" },
  { h: 44, tone: "a" },
  { h: 68, tone: "b" },
  { h: 80, tone: "c" },
  { h: 52, tone: "a" },
];

const buildingFill: Record<string, string> = {
  a: "linear-gradient(180deg,#FFFFFF 0%,#E8F4EE 100%)",
  b: "linear-gradient(180deg,#F4FBFF 0%,#D7E8F2 100%)",
  c: "linear-gradient(180deg,#F7FBF8 0%,#D5EDE3 100%)",
};

function Windows({ rows = 6, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="absolute inset-x-[18%] top-[12%] bottom-[18%] grid gap-[3px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{
            background: i % 5 === 0 ? "rgba(24,179,104,0.18)" : "rgba(15,23,42,0.08)",
          }}
        />
      ))}
    </div>
  );
}

export default function ScrollCityRide() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.28, 0.52, 0.72, 1],
    ["6%", "38%", "62%", "48%", "10%"]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.32, 0.58, 0.82, 1],
    [1, 0.88, 0.78, 0.92, 1.04]
  );
  const flip = useTransform(scrollYProgress, [0.68, 0.78], [1, -1]);
  const bob = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const battery = useTransform(scrollYProgress, [0, 0.62, 0.78, 1], [100, 41, 41, 100]);
  const rangeKm = useTransform(scrollYProgress, [0, 0.62, 1], [120, 48, 120]);
  const speed = useTransform(scrollYProgress, [0, 0.18, 0.55, 0.82, 1], [0, 28, 42, 18, 0]);
  const cityX = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const cloudX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const roadDash = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const hudY = useTransform(scrollYProgress, [0, 0.15], [12, 0]);
  const hudOp = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const hubOp = useTransform(scrollYProgress, [0, 0.18, 0.38], [1, 1, 0.2]);
  const yardOp = useTransform(scrollYProgress, [0.62, 0.82, 1], [0.15, 0.9, 1]);

  const [hud, setHud] = useState({ battery: 100, range: 120, speed: 0 });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < 0.22) setBeat(0);
    else if (value < 0.48) setBeat(1);
    else if (value < 0.74) setBeat(2);
    else setBeat(3);

    setHud({
      battery: Math.round(battery.get()),
      range: Math.round(rangeKm.get()),
      speed: Math.round(speed.get()),
    });
  });

  const chargeTone =
    hud.battery > 70 ? "#16A34A" : hud.battery > 35 ? "#D97706" : "#E11D48";

  return (
    <div ref={ref} className="relative mt-6 h-[320vh] sm:mt-10 sm:h-[340vh]">
      <style>{`
        @keyframes ride-lane {
          to { background-position: 0 56px; }
        }
        @keyframes ride-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .ride-lane {
          background-image: repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.95) 0 16px,
            transparent 16px 44px
          );
          animation: ride-lane 0.55s linear infinite;
        }
        .ride-float { animation: ride-float 7s ease-in-out infinite; }
        .ride-bike {
          width: min(52vw, 340px);
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 22px 28px rgba(15,23,42,0.18));
        }
        @media (max-width: 640px) {
          .ride-bike { width: min(68vw, 240px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ride-lane, .ride-float { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-[4.6rem] flex h-[calc(100svh-5rem)] items-center sm:top-24 sm:h-[78vh]">
        <div className="relative mx-auto h-full w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-white bg-[#F4FAF7] shadow-[0_30px_80px_rgba(15,23,42,0.10)] sm:rounded-[32px]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#B9E4FF_0%,#E7F6FF_28%,#F4FAF7_58%,#E8F3EC_100%)]" />
          <div className="pointer-events-none absolute left-[12%] top-6 h-16 w-16 rounded-full bg-[#FFE08A] shadow-[0_0_50px_rgba(255,224,138,0.85)] sm:h-20 sm:w-20" />
          <motion.div className="pointer-events-none absolute inset-x-0 top-8 h-16" style={{ x: cloudX }}>
            <div className="ride-float absolute left-[18%] h-8 w-24 rounded-full bg-white/80 blur-[1px]" />
            <div className="ride-float absolute left-[48%] top-2 h-10 w-32 rounded-full bg-white/70" style={{ animationDelay: "1.2s" }} />
            <div className="ride-float absolute left-[72%] h-7 w-20 rounded-full bg-white/75" style={{ animationDelay: "0.6s" }} />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-x-[-6%] bottom-[36%] flex h-[34%] items-end gap-2 px-[6%] sm:bottom-[34%] sm:h-[38%]"
            style={{ x: cityX }}
          >
            {skyline.map((b, i) => (
              <div
                key={i}
                className="relative min-w-0 flex-1 overflow-hidden rounded-t-[8px] border border-white/80 shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                style={{
                  height: `${b.h}%`,
                  background: buildingFill[b.tone],
                }}
              >
                <Windows rows={4 + (i % 3)} cols={2 + (i % 2)} />
                {i % 4 === 0 ? (
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#18B368]" />
                ) : null}
              </div>
            ))}
          </motion.div>

          <div className="pointer-events-none absolute bottom-[34%] left-[8%] z-[5] hidden sm:block">
            <div className="h-16 w-3 rounded-full bg-[#16A34A]" />
            <div className="-mt-2 ml-[-10px] h-10 w-14 rounded-full bg-[#22C55E]" />
          </div>
          <div className="pointer-events-none absolute bottom-[34%] right-[12%] z-[5] hidden sm:block">
            <div className="h-12 w-3 rounded-full bg-[#15803D]" />
            <div className="-mt-2 ml-[-8px] h-8 w-12 rounded-full bg-[#4ADE80]" />
          </div>

          <motion.div
            className="absolute left-[3%] bottom-[31%] z-10 hidden w-[18%] sm:block"
            style={{ opacity: hubOp }}
          >
            <div className="relative h-28 overflow-hidden rounded-t-[18px] border border-white bg-white shadow-[0_12px_30px_rgba(24,179,104,0.16)]">
              <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-[#18B368]" />
              <div className="absolute inset-x-6 top-8 bottom-6 rounded-md bg-[#E8F8F0]" />
              <p className="absolute inset-x-0 bottom-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#18B368]">
                Hub
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-[4%] bottom-[31%] z-10 hidden w-[16%] sm:block"
            style={{ opacity: yardOp }}
          >
            <div className="relative h-24 overflow-hidden rounded-t-[16px] border border-white bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-x-4 top-3 flex justify-center gap-1">
                {[0, 1, 2].map((n) => (
                  <span
                    key={n}
                    className="h-5 w-2 rounded-sm"
                    style={{
                      background: hud.battery > 40 + n * 20 ? "#18B368" : "#D1FAE5",
                    }}
                  />
                ))}
              </div>
              <p className="absolute inset-x-0 bottom-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Yard
              </p>
            </div>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 h-[38%] sm:h-[36%]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D7E4DC] to-[#C5D4CC]" />
            <div
              className="absolute left-1/2 top-0 h-full w-[140%] -translate-x-1/2"
              style={{
                clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, #D7DDE3 0%, #B8C0C8 48%, #9AA3AC 100%)",
              }}
            />
            <div className="absolute left-[18%] top-0 h-full w-[2px] bg-white/70" />
            <div className="absolute right-[18%] top-0 h-full w-[2px] bg-white/70" />
            <motion.div
              className="ride-lane absolute left-1/2 top-6 h-[80%] w-[4px] -translate-x-1/2 opacity-90"
              style={{ y: roadDash }}
            />
          </div>

          <motion.div
            className="absolute z-20 will-change-transform"
            style={{
              left: x,
              bottom: "22%",
              scale,
              y: bob,
            }}
          >
            <motion.div style={{ scaleX: flip }} className="relative">
              <img
                src="/evuddy-scooter.png"
                alt="EVUDDY electric scooter on a live city ride"
                className="ride-bike"
              />
              <div className="pointer-events-none absolute left-[18%] right-[12%] -bottom-1 h-3 rounded-[100%] bg-slate-900/20 blur-md sm:h-4" />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute left-3 top-3 z-30 max-w-[78%] rounded-2xl border border-white/80 bg-white/85 px-3 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:left-5 sm:top-5 sm:max-w-sm sm:px-5 sm:py-4"
            style={{ y: hudY, opacity: hudOp }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#18B368]">
              {beats[beat].kicker}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#0F172A] sm:text-2xl">
              {beats[beat].title}
            </h2>
            <p className="mt-1 hidden text-sm leading-6 text-slate-500 sm:block">
              {beats[beat].text}
            </p>
          </motion.div>

          <motion.div
            className="absolute right-3 top-3 z-30 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:right-5 sm:top-5 sm:px-4"
            style={{ opacity: hudOp }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0F172A]">
                Live GPS
              </p>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Battery
                </p>
                <p className="text-lg font-black tabular-nums" style={{ color: chargeTone }}>
                  {hud.battery}%
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Range
                </p>
                <p className="text-lg font-black tabular-nums text-[#0F172A]">{hud.range} km</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Speed
                </p>
                <p className="text-lg font-black tabular-nums text-[#0F172A]">{hud.speed}</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-slate-100 sm:w-44">
              <div
                className="h-full rounded-full transition-[width] duration-150"
                style={{ width: `${hud.battery}%`, background: chargeTone }}
              />
            </div>
          </motion.div>

          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
            {beats.map((item, i) => (
              <span
                key={item.kicker}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: beat === i ? 22 : 8,
                  background: beat === i ? "#18B368" : "rgba(15,23,42,0.18)",
                }}
              />
            ))}
          </div>

          <p className="absolute bottom-3 right-4 z-30 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
            Scroll to ride
          </p>
        </div>
      </div>
    </div>
  );
}
