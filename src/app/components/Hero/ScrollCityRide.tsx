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
    kicker: "03 · Night",
    title: "Lit route. Full control.",
    text: "Streetlights, open road, and a battery that still has room to roam.",
  },
  {
    kicker: "04 · Return",
    title: "Home. Swap. Repeat.",
    text: "Ride done. The scooter returns to the yard and charges for the next rider.",
  },
];

const skyline = [42, 68, 54, 88, 48, 76, 62, 94, 50, 72, 58, 84, 46, 70, 90, 52];

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
          className="ride-window rounded-[1px]"
          style={{ animationDelay: `${(i % 9) * 0.35}s` }}
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
    [1, 0.86, 0.74, 0.9, 1.04]
  );
  const flip = useTransform(scrollYProgress, [0.68, 0.78], [1, -1]);
  const bob = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const night = useTransform(scrollYProgress, [0.12, 0.42, 0.86], [0, 1, 0.55]);
  const dusk = useTransform(scrollYProgress, [0, 0.28, 0.55], [0, 0.85, 1]);
  const lightGlow = useTransform(scrollYProgress, [0.38, 0.62, 0.9], [0.15, 1, 0.45]);
  const headlight = useTransform(scrollYProgress, [0.3, 0.48, 0.92], [0, 0.9, 0.35]);
  const battery = useTransform(scrollYProgress, [0, 0.62, 0.78, 1], [100, 41, 41, 100]);
  const rangeKm = useTransform(scrollYProgress, [0, 0.62, 1], [120, 48, 120]);
  const speed = useTransform(scrollYProgress, [0, 0.18, 0.55, 0.82, 1], [0, 28, 42, 18, 0]);
  const skyShift = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const cityX = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const roadDash = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const hudY = useTransform(scrollYProgress, [0, 0.15], [12, 0]);
  const hudOp = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const daySky = useTransform(dusk, [0, 1], [1, 0]);
  const cityOp = useTransform(dusk, [0, 1], [0.35, 1]);
  const hubOp = useTransform(scrollYProgress, [0, 0.18, 0.35], [1, 1, 0.15]);
  const yardOp = useTransform(scrollYProgress, [0.62, 0.82, 1], [0.1, 0.85, 1]);

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
    hud.battery > 70 ? "#6EE7A8" : hud.battery > 35 ? "#FBBF24" : "#FB7185";

  return (
    <div ref={ref} className="relative mt-6 h-[320vh] sm:mt-10 sm:h-[340vh]">
      <style>{`
        @keyframes ride-lane {
          to { background-position: 0 56px; }
        }
        @keyframes ride-window {
          0%, 100% { opacity: 0.22; }
          50% { opacity: 0.95; }
        }
        @keyframes ride-scan {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(220%); }
        }
        .ride-lane {
          background-image: repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.55) 0 18px,
            transparent 18px 46px
          );
          animation: ride-lane 0.55s linear infinite;
        }
        .ride-window {
          background: #fde68a;
          opacity: 0.35;
          animation: ride-window 3.6s ease-in-out infinite;
        }
        .ride-scan {
          animation: ride-scan 4.8s linear infinite;
        }
        .ride-orbit {
          animation: ride-orbit 18s linear infinite;
        }
        .ride-bike {
          width: min(52vw, 340px);
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 28px 32px rgba(0,0,0,0.45));
        }
        @media (max-width: 640px) {
          .ride-bike { width: min(68vw, 240px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ride-lane, .ride-window, .ride-scan { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-[4.6rem] flex h-[calc(100svh-5rem)] items-center sm:top-24 sm:h-[78vh]">
        <div className="relative mx-auto h-full w-full max-w-[1280px] overflow-hidden rounded-[22px] border border-white/10 bg-[#071018] shadow-[0_40px_100px_rgba(7,16,24,0.45)] sm:rounded-[32px]">
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ y: skyShift }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #7EB7E8 0%, #C9DCE8 28%, #E8F0EA 52%, #D7E4DC 100%)",
                opacity: daySky,
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #071018 0%, #102433 38%, #163024 100%)",
                opacity: dusk,
              }}
            />
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_70%_0%,rgba(236,42,140,0.18),transparent_42%)]" />
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_18%_10%,rgba(24,179,104,0.16),transparent_40%)]" />
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-x-[-8%] bottom-[36%] flex h-[34%] items-end gap-2 px-[6%] sm:bottom-[34%] sm:h-[38%]"
            style={{ x: cityX, opacity: cityOp }}
          >
            {skyline.map((h, i) => (
              <div
                key={i}
                className="relative min-w-0 flex-1 overflow-hidden rounded-t-[6px]"
                style={{
                  height: `${h}%`,
                  background:
                    i % 5 === 0
                      ? "linear-gradient(180deg,#1b3a44,#0d1c22)"
                      : "linear-gradient(180deg,#15262e,#0a1419)",
                  boxShadow: i % 4 === 0 ? "0 0 24px rgba(24,179,104,0.12)" : undefined,
                }}
              >
                <Windows rows={4 + (i % 3)} cols={2 + (i % 2)} />
                {i % 6 === 2 ? (
                  <div className="absolute right-1 top-2 h-1.5 w-1.5 rounded-full bg-[#EC2A8C] shadow-[0_0_10px_#EC2A8C]" />
                ) : null}
              </div>
            ))}
          </motion.div>

          <motion.div
            className="absolute left-[3%] bottom-[31%] z-10 hidden w-[18%] sm:block"
            style={{ opacity: hubOp }}
          >
            <div className="relative h-28 overflow-hidden rounded-t-[18px] border border-white/15 bg-gradient-to-b from-white/20 to-[#0b1f18]/80 shadow-[0_0_40px_rgba(24,179,104,0.18)]">
              <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-[#18B368]/80" />
              <div className="absolute inset-x-6 top-8 bottom-4 rounded-md bg-[#071018]/50" />
              <p className="absolute inset-x-0 bottom-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6EE7A8]">
                Hub
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-[4%] bottom-[31%] z-10 hidden w-[16%] sm:block"
            style={{ opacity: yardOp }}
          >
            <div className="relative h-24 overflow-hidden rounded-t-[16px] border border-white/10 bg-gradient-to-b from-[#1a2430] to-[#0b1218]">
              <div className="absolute inset-x-4 top-3 flex justify-center gap-1">
                {[0, 1, 2].map((n) => (
                  <span
                    key={n}
                    className="h-5 w-2 rounded-sm bg-[#18B368]/80"
                    style={{ opacity: hud.battery > 40 + n * 20 ? 1 : 0.2 }}
                  />
                ))}
              </div>
              <p className="absolute inset-x-0 bottom-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Yard
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-x-0 top-[10%] flex justify-around px-8 sm:px-16"
            style={{ opacity: lightGlow }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FDE68A] shadow-[0_0_22px_rgba(253,230,138,1)] sm:h-3.5 sm:w-3.5" />
                <span className="h-[9vh] w-px bg-gradient-to-b from-[#FDE68A]/80 to-transparent sm:h-[12vh]" />
                <span className="h-10 w-16 -translate-y-2 bg-[radial-gradient(ellipse_at_top,rgba(253,230,138,0.28),transparent_70%)] sm:h-14 sm:w-24" />
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 h-[38%] sm:h-[36%]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#12181c] to-[#0a0e11]" />
            <div
              className="absolute left-1/2 top-0 h-full w-[140%] -translate-x-1/2"
              style={{
                clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, #2a3238 0%, #1a1f24 42%, #111417 100%)",
              }}
            />
            <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-white/50 via-white/20 to-transparent" />
            <motion.div
              className="ride-lane absolute left-1/2 top-6 h-[80%] w-[3px] -translate-x-1/2 opacity-70"
              style={{ y: roadDash }}
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: night }}
          >
            <div className="ride-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#18B368]/8 to-transparent" />
          </motion.div>

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
              <motion.div
                className="pointer-events-none absolute left-full top-[38%] h-10 w-28 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_left,rgba(253,230,138,0.55),transparent_70%)] sm:h-14 sm:w-40"
                style={{ opacity: headlight }}
              />
              <img
                src="/evuddy-scooter.png"
                alt="EVUDDY electric scooter on a live city ride"
                className="ride-bike"
              />
              <div className="pointer-events-none absolute left-[18%] right-[12%] -bottom-2 h-4 rounded-[100%] bg-black/45 blur-md sm:h-5" />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute left-3 top-3 z-30 max-w-[78%] rounded-2xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-md sm:left-5 sm:top-5 sm:max-w-sm sm:px-5 sm:py-4"
            style={{ y: hudY, opacity: hudOp }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6EE7A8]">
              {beats[beat].kicker}
            </p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-white sm:text-2xl">
              {beats[beat].title}
            </h2>
            <p className="mt-1 hidden text-sm leading-6 text-white/70 sm:block">
              {beats[beat].text}
            </p>
          </motion.div>

          <motion.div
            className="absolute right-3 top-3 z-30 rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur-md sm:right-5 sm:top-5 sm:px-4"
            style={{ opacity: hudOp }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#18B368]/80" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18B368]" />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
                Live GPS
              </p>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Battery
                </p>
                <p className="text-lg font-black tabular-nums" style={{ color: chargeTone }}>
                  {hud.battery}%
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Range
                </p>
                <p className="text-lg font-black tabular-nums text-white">{hud.range} km</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Speed
                </p>
                <p className="text-lg font-black tabular-nums text-white">{hud.speed}</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-white/10 sm:w-44">
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
                  background: beat === i ? "#18B368" : "rgba(255,255,255,0.28)",
                }}
              />
            ))}
          </div>

          <p className="absolute bottom-3 right-4 z-30 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:block">
            Scroll to ride
          </p>
        </div>
      </div>
    </div>
  );
}
