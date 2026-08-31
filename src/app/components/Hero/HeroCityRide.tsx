"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useEvuddySideSrc } from "./useEvuddySideSrc";

function Tree({ size = 1 }: { size?: number }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `scale(${size})`, transformOrigin: "bottom" }}
    >
      <div className="relative">
        <div className="h-9 w-11 rounded-[40%] bg-[#166534] sm:h-11 sm:w-14" />
        <div className="absolute -left-2 top-2 h-7 w-8 rounded-[45%] bg-[#22C55E]/90 sm:h-8 sm:w-9" />
        <div className="absolute -right-1.5 top-0 h-6 w-7 rounded-[50%] bg-[#4ADE80] sm:h-7 sm:w-8" />
      </div>
      <div className="-mt-1 h-8 w-1.5 rounded-full bg-[#7A4A22] shadow-[2px_0_0_rgba(0,0,0,0.12)]" />
    </div>
  );
}

function Person({ shirt, pants = "#1E3A5F" }: { shirt: string; pants?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="h-2.5 w-2.5 rounded-full bg-[#F8C9A8] ring-1 ring-black/5 sm:h-3 sm:w-3" />
      <div className="h-4 w-2.5 rounded-[3px] sm:h-5 sm:w-3" style={{ background: shirt }} />
      <div className="flex gap-px">
        <div className="h-3.5 w-[3px] sm:h-4" style={{ background: pants }} />
        <div className="h-3.5 w-[3px] sm:h-4" style={{ background: pants }} />
      </div>
    </div>
  );
}

function Tower({
  height,
  width,
  wall,
  accent,
  windows = "#7DD3FC",
}: {
  height: number;
  width: number;
  wall: string;
  accent: string;
  windows?: string;
}) {
  return (
    <div className="relative shrink-0 self-end" style={{ width, height }}>
      <div
        className="absolute inset-x-3 top-0 h-2 rounded-t-sm"
        style={{ background: accent }}
      />
      <div
        className="absolute inset-x-0 top-2 bottom-0 overflow-hidden rounded-t-[4px] shadow-[8px_12px_24px_rgba(8,17,47,0.18)]"
        style={{ background: wall }}
      >
        <div
          className="evuddy-city-windows absolute inset-[6px] opacity-90"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${windows} 0 5px, transparent 5px 11px), repeating-linear-gradient(180deg, ${windows} 0 7px, transparent 7px 14px)`,
            backgroundBlendMode: "multiply",
            opacity: 0.55,
          }}
        />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/20 to-transparent" />
      </div>
    </div>
  );
}

function House({ wall, roof }: { wall: string; roof: string }) {
  return (
    <div className="relative w-[88px] shrink-0 sm:w-[104px]">
      <div
        className="absolute -top-7 left-[-6px] right-[-6px] h-8 sm:-top-8 sm:h-9"
        style={{
          background: roof,
          clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          filter: "drop-shadow(0 6px 8px rgba(15,23,42,0.12))",
        }}
      />
      <div
        className="relative h-[68px] overflow-hidden rounded-sm shadow-[0_10px_20px_rgba(15,23,42,0.1)] sm:h-[80px]"
        style={{ background: wall }}
      >
        <div className="absolute left-3 top-3 h-3.5 w-3.5 rounded-[2px] bg-[#7DD3FC]/90 shadow-[inset_0_0_6px_rgba(255,255,255,0.7)] sm:h-4 sm:w-4" />
        <div className="absolute right-3 top-3 h-3.5 w-3.5 rounded-[2px] bg-[#7DD3FC]/90 shadow-[inset_0_0_6px_rgba(255,255,255,0.7)] sm:h-4 sm:w-4" />
        <div className="absolute bottom-0 left-1/2 h-7 w-[18px] -translate-x-1/2 rounded-t-[2px] bg-[#7C2D12]" />
      </div>
    </div>
  );
}

function Shop({ name, stripe, glow }: { name: string; stripe: string; glow: string }) {
  return (
    <div className="relative w-[116px] shrink-0 sm:w-[132px]">
      <div
        className="h-3 rounded-t-sm"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${stripe} 0 14px, #fff 14px 24px)`,
        }}
      />
      <div className="relative h-[78px] overflow-hidden rounded-b-md bg-white shadow-[0_14px_28px_rgba(15,23,42,0.12)] sm:h-[88px]">
        <p className="pt-1.5 text-center text-[9px] font-black uppercase tracking-[0.16em] text-[#0F172A] sm:text-[10px]">
          {name}
        </p>
        <div
          className="mx-2.5 mt-1.5 h-9 overflow-hidden rounded-sm sm:h-10"
          style={{
            background: `linear-gradient(180deg, ${glow} 0%, #0F172A 100%)`,
            boxShadow: `inset 0 0 18px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}

function HubStation({ label }: { label: string }) {
  return (
    <div className="relative flex h-full w-[520px] shrink-0 items-end px-4 sm:px-6">
      <div className="absolute inset-x-5 bottom-0 top-4 rounded-t-[28px] border border-[#18B368]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,168,0.28),transparent_58%)] sm:inset-x-7" />
      <div className="relative mb-1 w-full">
        <div className="mx-auto max-w-[280px] sm:max-w-[320px]">
          <div className="relative h-8 overflow-hidden rounded-t-[14px] bg-gradient-to-r from-[#0F172A] via-[#18B368] to-[#0F172A] sm:h-9">
            <div className="evuddy-city-sheen pointer-events-none absolute inset-0" />
            <div className="absolute inset-x-8 -top-2 h-2.5 rounded-full bg-[#6EE7A8] blur-[1px]" />
            <p className="relative pt-2 text-center text-[9px] font-black tracking-[0.32em] text-white sm:text-[10px]">
              EVUDDY
            </p>
          </div>
          <div className="relative overflow-hidden bg-[#07111F] px-4 pb-3 pt-3 shadow-[0_20px_40px_rgba(15,23,42,0.28)] sm:px-5 sm:pb-4">
            <p className="text-center text-[17px] font-black tracking-[0.22em] text-[#6EE7A8] sm:text-[21px]">
              HUB
            </p>
            <p className="mt-0.5 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-[9px]">
              {label}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
              {[0, 1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="h-8 rounded-sm border border-[#18B368]/40 bg-[#052e16] shadow-[inset_0_0_10px_rgba(110,231,168,0.35)] sm:h-10"
                />
              ))}
            </div>
          </div>
          <div className="h-2 bg-gradient-to-r from-[#16A34A] via-[#6EE7A8] to-[#16A34A]" />
        </div>
      </div>
    </div>
  );
}

function Station() {
  return (
    <div className="relative flex h-full w-[740px] shrink-0 items-end px-5 sm:px-8">
      <div className="relative mb-1 w-full">
        <div className="absolute -top-9 left-4 right-4 h-9 rounded-t-[20px] bg-gradient-to-r from-[#0F172A] via-[#1E3A5F] to-[#0F172A] sm:-top-11 sm:h-11" />
        <div className="relative overflow-hidden rounded-t-[14px] bg-[#E8EEF4] pt-3 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
          <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-[#18B368] sm:text-[10px]">
            EVUDDY Nagar Station
          </p>
          <div className="mx-4 mt-2 flex h-14 items-end gap-1.5 rounded-t-md bg-[#1E293B] px-3 sm:h-16">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-8 flex-1 rounded-t-sm bg-gradient-to-t from-[#38BDF8]/40 to-[#7DD3FC] sm:h-10"
              />
            ))}
          </div>
          <div className="flex h-7 items-center justify-between bg-[#CBD5E1] px-4">
            <Person shirt="#EC2A8C" />
            <Person shirt="#18B368" />
            <Person shirt="#0EA5E9" />
            <Person shirt="#F59E0B" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Skyline() {
  return (
    <div className="flex h-full items-end gap-1.5 px-8 opacity-70">
      {[
        [42, "#0B3B4A"],
        [68, "#123A56"],
        [54, "#0F172A"],
        [88, "#164E63"],
        [46, "#0F172A"],
        [72, "#134E4A"],
        [96, "#0F172A"],
        [58, "#1E3A5F"],
        [80, "#14532D"],
        [50, "#0F172A"],
        [74, "#123A56"],
        [62, "#0B3B4A"],
      ].map(([h, c], i) => (
        <div
          key={i}
          className="w-7 shrink-0 rounded-t-[3px] sm:w-9"
          style={{
            height: Number(h),
            background: `linear-gradient(180deg, ${c} 0%, #07111F 100%)`,
            boxShadow: "inset -8px 0 12px rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}

function Streetscape() {
  return (
    <>
      <HubStation label="EVUDDY HUB" />

      <div className="relative flex h-full w-[920px] shrink-0 items-end gap-3 px-6 pb-0 sm:gap-5 sm:px-8">
        <Tower height={118} width={52} wall="#1E293B" accent="#18B368" />
        <Tree size={1.05} />
        <House wall="#FFF7ED" roof="#EA580C" />
        <Person shirt="#18B368" />
        <Tower height={96} width={44} wall="#312E81" accent="#EC2A8C" windows="#C4B5FD" />
        <Tree size={0.85} />
        <House wall="#F8FAFC" roof="#0F766E" />
        <Person shirt="#EC2A8C" />
        <House wall="#FDF2F8" roof="#BE185D" />
        <Tree size={1} />
        <Person shirt="#0F172A" pants="#64748B" />
        <House wall="#EFF6FF" roof="#1D4ED8" />
        <Tower height={132} width={56} wall="#0F172A" accent="#6EE7A8" />
        <Tree size={0.9} />
      </div>

      <div className="relative flex h-full w-[980px] shrink-0 items-end gap-3 px-5 pb-0 sm:gap-4 sm:px-6">
        <Tree size={0.75} />
        <Shop name="Daily Mart" stripe="#18B368" glow="#14532D" />
        <Person shirt="#F8FAFC" pants="#0F172A" />
        <Shop name="Cafe Leaf" stripe="#EC2A8C" glow="#831843" />
        <Person shirt="#FDE68A" />
        <Shop name="Phone Fix" stripe="#0EA5E9" glow="#0C4A6E" />
        <div className="relative w-[88px] shrink-0 sm:w-[96px]">
          <div className="h-[82px] overflow-hidden rounded-md bg-[#0F172A] shadow-[0_0_24px_rgba(24,179,104,0.35)] sm:h-[90px]">
            <p className="pt-2.5 text-center text-[8px] font-black uppercase tracking-[0.16em] text-[#6EE7A8] sm:pt-3 sm:text-[9px]">
              EV Charge
            </p>
            <div className="evuddy-city-pulse mx-auto mt-2.5 h-8 w-8 rounded-full border-[3px] border-[#18B368] sm:mt-3 sm:h-9 sm:w-9" />
          </div>
        </div>
        <Person shirt="#18B368" />
        <Tree size={0.95} />
      </div>

      <Station />

      <div className="relative flex h-full w-[420px] shrink-0 items-end justify-center px-3">
        <div className="absolute bottom-[-42%] left-5 right-5">
          <div className="h-[3px] bg-[#334155]" />
          <div className="mt-[5px] h-[3px] bg-[#334155]" />
          <div className="mt-[5px] h-[3px] bg-[#334155]" />
        </div>
        <div className="relative mb-7 flex items-end gap-2">
          <div className="h-14 w-2.5 rounded-sm bg-[#DC2626] sm:h-16 sm:w-3" />
          <div className="mb-8 h-1.5 w-24 origin-left rotate-[-16deg] rounded-full border border-red-400 bg-[#F8FAFC] sm:w-28" />
          <div className="h-7 w-7 rounded-sm bg-[#111827] shadow-[0_0_12px_rgba(34,197,94,0.45)] sm:h-8 sm:w-8">
            <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-[#FACC15]" />
            <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      <div className="relative flex h-full w-[600px] shrink-0 items-end px-6 sm:px-8">
        <div className="absolute bottom-0 left-8 right-8 h-[54%]">
          <div className="absolute bottom-7 left-5 h-[68%] w-3 rounded-t-sm bg-[#94A3B8] sm:left-6 sm:w-4" />
          <div className="absolute bottom-7 right-5 h-[68%] w-3 rounded-t-sm bg-[#94A3B8] sm:right-6 sm:w-4" />
          <div className="absolute left-0 right-0 top-3 h-8 rounded-sm bg-[#CBD5E1]/80 backdrop-blur-[1px] sm:top-4 sm:h-10" />
        </div>
        <div className="relative z-10 mb-1 flex w-full justify-between px-10">
          <Tree size={0.7} />
          <Person shirt="#22C55E" />
          <Tree size={0.8} />
        </div>
      </div>

      <HubStation label="EVUDDY YARD" />
    </>
  );
}

const WORLD = 520 + 920 + 980 + 740 + 420 + 600 + 520;

function subscribeWidth(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export default function HeroCityRide() {
  const bikeSrc = useEvuddySideSrc();
  const reduceMotion = useReducedMotion();
  const viewW = useSyncExternalStore(
    subscribeWidth,
    () => window.innerWidth,
    () => 360
  );
  const travel = Math.max(WORLD - Math.min(viewW, 1280), 900);

  return (
    <div className="relative mx-auto mt-5 w-full max-w-[1280px] overflow-hidden rounded-[20px] border border-white/80 shadow-[0_28px_80px_rgba(15,23,42,0.14)] sm:mt-8 sm:rounded-[32px]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -160px 0; }
        }
        @keyframes evuddy-city-sheen {
          0% { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(180%) skewX(-18deg); }
        }
        @keyframes evuddy-city-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(24,179,104,0.55); }
          50% { box-shadow: 0 0 0 8px rgba(24,179,104,0); }
        }
        @keyframes evuddy-city-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.95) 0 26px, transparent 26px 56px);
          animation: evuddy-drive 0.38s linear infinite;
        }
        .evuddy-tiles {
          background-image: repeating-linear-gradient(90deg, #D6D3D1 0 16px, #C4C0BC 16px 17px);
        }
        .evuddy-city-bike {
          width: 132px;
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          background: transparent;
          filter: drop-shadow(0 10px 12px rgba(15,23,42,0.28)) drop-shadow(0 0 18px rgba(24,179,104,0.35));
        }
        .evuddy-city-sheen {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          animation: evuddy-city-sheen 4.8s ease-in-out infinite;
        }
        .evuddy-city-pulse {
          animation: evuddy-city-pulse 1.8s ease-out infinite;
        }
        .evuddy-city-windows {
          animation: evuddy-city-glow 3.6s ease-in-out infinite;
        }
        @media (min-width: 640px) {
          .evuddy-city-bike { width: 198px; }
        }
        @media (min-width: 1024px) {
          .evuddy-city-bike { width: 228px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive, .evuddy-city-sheen, .evuddy-city-pulse, .evuddy-city-windows { animation: none !important; }
        }
      `}</style>

      <div
        className="relative h-[230px] overflow-hidden sm:h-[360px] lg:h-[440px]"
        aria-label="Animated EVUDDY city with electric scooters moving through hubs and streets"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07111F_0%,#123A56_28%,#3B82A0_48%,#E8F6FF_62%,#D7EEE4_78%,#9CB8A8_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(253,224,71,0.28),transparent_32%),radial-gradient(ellipse_at_82%_8%,rgba(110,231,168,0.18),transparent_36%)]" />

        <div className="absolute right-[14%] top-5 h-10 w-10 rounded-full bg-[#FFE08A] shadow-[0_0_40px_18px_rgba(253,224,71,0.45)] sm:top-7 sm:h-16 sm:w-16" />

        <motion.div
          className="absolute inset-x-0 top-5 h-10 sm:top-7 sm:h-12"
          animate={reduceMotion ? undefined : { x: ["0%", "-18%", "0%"] }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-[6%] h-6 w-20 rounded-full bg-white/25 blur-[1px] sm:h-8 sm:w-28" />
          <div className="absolute left-[34%] top-1 h-7 w-28 rounded-full bg-white/20 sm:h-9 sm:w-36" />
          <div className="absolute left-[62%] h-5 w-16 rounded-full bg-white/22 sm:h-7 sm:w-24" />
          <div className="absolute left-[82%] top-2 h-6 w-24 rounded-full bg-white/18 sm:h-8 sm:w-32" />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-[92px] h-[88px] sm:bottom-[140px] sm:h-[120px] lg:bottom-[156px]"
          animate={reduceMotion ? undefined : { x: [0, -Math.round(travel * 0.28), 0] }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        >
          <div className="flex h-full w-[220%] items-end">
            <Skyline />
            <Skyline />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 h-full will-change-transform"
          style={{ width: WORLD, transform: "translateZ(0)" }}
          animate={reduceMotion ? undefined : { x: [0, -travel, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[62px] bg-gradient-to-b from-[#4B5563] via-[#374151] to-[#1F2937] sm:h-[100px] lg:h-[114px]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#18B368]/40 via-[#6EE7A8] to-[#18B368]/40 sm:h-1" />
            <div className="evuddy-drive absolute inset-x-0 top-[46%] h-[4px] sm:h-[5px]" />
            <div className="absolute inset-x-0 bottom-0 h-2 bg-[#020617]/50" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
          <div className="evuddy-tiles absolute inset-x-0 bottom-[62px] h-[15px] sm:bottom-[100px] sm:h-[18px] lg:bottom-[114px]" />
          <div className="absolute inset-x-0 bottom-[77px] top-8 flex items-stretch sm:bottom-[118px] lg:bottom-[132px]">
            <Streetscape />
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#07111F]/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#07111F]/20 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#07111F]/20 to-transparent sm:w-24" />

        <motion.div
          className="absolute bottom-[8px] left-[11%] z-20 origin-[center_bottom] sm:bottom-[14px] sm:left-[17%] lg:bottom-[16px]"
          animate={
            reduceMotion
              ? undefined
              : {
                  scaleX: [-1, -1, 1, 1, -1],
                  y: [0, -3, 0, -2, 0],
                }
          }
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.46, 0.5, 0.96, 1],
          }}
        >
          {bikeSrc ? (
            <img src={bikeSrc} alt="EVUDDY scooter" className="evuddy-city-bike" />
          ) : (
            <div className="evuddy-city-bike h-[72px] rounded-md bg-[#EC2A8C]/90 sm:h-[96px]" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
