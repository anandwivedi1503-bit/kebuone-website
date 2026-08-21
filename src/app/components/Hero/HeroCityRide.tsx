"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useEvuddySideSrc } from "./useEvuddySideSrc";

function Tree({ size = 1 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ transform: `scale(${size})`, transformOrigin: "bottom" }}>
      <div className="h-10 w-10 rounded-full bg-[#3F9A4F] shadow-[inset_-6px_-4px_0_rgba(0,0,0,0.08)] sm:h-11 sm:w-11" />
      <div className="-mt-1 h-8 w-1.5 rounded-full bg-[#7A4A22]" />
    </div>
  );
}

function Person({ shirt, pants = "#1E3A5F" }: { shirt: string; pants?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="h-2.5 w-2.5 rounded-full bg-[#F8C9A8] sm:h-3 sm:w-3" />
      <div className="h-4 w-2.5 rounded-[3px] sm:h-5 sm:w-3" style={{ background: shirt }} />
      <div className="flex gap-px">
        <div className="h-3.5 w-[3px] sm:h-4" style={{ background: pants }} />
        <div className="h-3.5 w-[3px] sm:h-4" style={{ background: pants }} />
      </div>
    </div>
  );
}

function House({ wall, roof }: { wall: string; roof: string }) {
  return (
    <div className="relative w-[84px] shrink-0 sm:w-[96px]">
      <div
        className="absolute -top-6 left-[-5px] right-[-5px] h-7 sm:-top-7 sm:h-8"
        style={{ background: roof, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
      />
      <div className="relative h-[64px] overflow-hidden rounded-sm sm:h-[76px]" style={{ background: wall }}>
        <div className="absolute left-2.5 top-3 h-3 w-3 bg-[#7DD3FC] sm:left-3 sm:top-4 sm:h-[14px] sm:w-[14px]" />
        <div className="absolute right-2.5 top-3 h-3 w-3 bg-[#7DD3FC] sm:right-3 sm:top-4 sm:h-[14px] sm:w-[14px]" />
        <div className="absolute bottom-0 left-1/2 h-6 w-4 -translate-x-1/2 bg-[#9A3412]" />
      </div>
    </div>
  );
}

function Shop({ name, stripe }: { name: string; stripe: string }) {
  return (
    <div className="relative w-[108px] shrink-0 sm:w-[124px]">
      <div
        className="h-2.5 sm:h-3"
        style={{ backgroundImage: `repeating-linear-gradient(90deg, ${stripe} 0 12px, #fff 12px 22px)` }}
      />
      <div className="h-[72px] rounded-b-sm bg-white shadow-[0_8px_16px_rgba(15,23,42,0.06)] sm:h-[82px]">
        <p className="pt-1.5 text-center text-[9px] font-black uppercase tracking-[0.12em] text-[#0F172A] sm:pt-2 sm:text-[10px]">
          {name}
        </p>
        <div className="mx-2.5 mt-1.5 h-7 rounded-sm bg-[#E0F2FE] sm:mx-3 sm:mt-2 sm:h-8" />
      </div>
    </div>
  );
}

function HubStation({ label }: { label: string }) {
  return (
    <div className="relative flex h-full w-[500px] shrink-0 items-end px-4 sm:px-6">
      <div className="absolute inset-x-4 bottom-0 top-5 rounded-t-[20px] border border-[#18B368]/20 bg-[#ECFDF3]/70 sm:inset-x-6" />
      <div className="relative mb-1 w-full">
        <div className="mx-auto max-w-[268px] sm:max-w-[300px]">
          <div className="relative h-7 rounded-t-[10px] bg-[#18B368] sm:h-8">
            <div className="absolute inset-x-6 -top-2 h-2 rounded-full bg-[#86EFAC] sm:-top-2.5 sm:h-2.5" />
            <p className="pt-1.5 text-center text-[9px] font-black tracking-[0.28em] text-white sm:text-[10px]">
              EVUDDY
            </p>
          </div>
          <div className="relative overflow-hidden bg-[#0F172A] px-4 pb-3 pt-3 shadow-[0_16px_28px_rgba(15,23,42,0.18)] sm:px-5 sm:pb-4 sm:pt-4">
            <p className="text-center text-[16px] font-black tracking-[0.2em] text-[#6EE7A8] sm:text-[20px]">
              HUB
            </p>
            <p className="mt-0.5 text-center text-[8px] font-bold uppercase tracking-[0.16em] text-white/55 sm:text-[9px]">
              {label}
            </p>
            <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
              {[0, 1, 2, 3].map((n) => (
                <span
                  key={n}
                  className="h-8 rounded-sm border border-[#18B368]/50 bg-[#052e16] shadow-[inset_0_0_0_1px_rgba(110,231,168,0.25)] sm:h-10"
                />
              ))}
            </div>
          </div>
          <div className="h-2 bg-[#16A34A]" />
        </div>
      </div>
    </div>
  );
}

function Station() {
  return (
    <div className="relative flex h-full w-[720px] shrink-0 items-end px-5 sm:px-8">
      <div className="relative mb-1 w-full">
        <div className="absolute -top-8 left-4 right-4 h-8 rounded-t-[18px] bg-[#0F172A] sm:-top-10 sm:h-10" />
        <div className="relative overflow-hidden rounded-t-[12px] bg-[#E2E8F0] pt-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <p className="text-center text-[9px] font-black uppercase tracking-[0.18em] text-[#18B368] sm:text-[10px]">
            EVUDDY Nagar Station
          </p>
          <div className="mx-4 mt-2 flex h-14 items-end gap-1.5 rounded-t-md bg-[#334155] px-3 sm:h-16">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 flex-1 rounded-t-sm bg-[#7DD3FC]/70 sm:h-10" />
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

function Ecosystem() {
  return (
    <>
      <HubStation label="EVUDDY HUB" />

      <div className="relative flex h-full w-[880px] shrink-0 items-end gap-3 px-6 pb-0 sm:gap-5 sm:px-8">
        <Tree size={1.05} />
        <House wall="#FFF7ED" roof="#EA580C" />
        <Person shirt="#18B368" />
        <Tree size={0.85} />
        <House wall="#F8FAFC" roof="#0F766E" />
        <Person shirt="#EC2A8C" />
        <House wall="#FDF2F8" roof="#BE185D" />
        <Tree size={1} />
        <Person shirt="#0F172A" pants="#64748B" />
        <House wall="#EFF6FF" roof="#1D4ED8" />
        <Tree size={0.9} />
      </div>

      <div className="relative flex h-full w-[940px] shrink-0 items-end gap-3 px-5 pb-0 sm:gap-4 sm:px-6">
        <Tree size={0.75} />
        <Shop name="Daily Mart" stripe="#18B368" />
        <Person shirt="#F8FAFC" pants="#0F172A" />
        <Shop name="Cafe Leaf" stripe="#EC2A8C" />
        <Person shirt="#FDE68A" />
        <Shop name="Phone Fix" stripe="#0EA5E9" />
        <div className="relative w-[84px] shrink-0 sm:w-[92px]">
          <div className="h-[78px] rounded-sm bg-[#0F172A] sm:h-[86px]">
            <p className="pt-2.5 text-center text-[8px] font-black uppercase tracking-[0.14em] text-[#6EE7A8] sm:pt-3 sm:text-[9px]">
              EV Charge
            </p>
            <div className="mx-auto mt-2.5 h-7 w-7 rounded-full border-4 border-[#18B368] sm:mt-3 sm:h-8 sm:w-8" />
          </div>
        </div>
        <Person shirt="#18B368" />
        <Tree size={0.95} />
      </div>

      <Station />

      <div className="relative flex h-full w-[400px] shrink-0 items-end justify-center px-3">
        <div className="absolute bottom-[-42%] left-5 right-5">
          <div className="h-[3px] bg-[#334155]" />
          <div className="mt-[5px] h-[3px] bg-[#334155]" />
          <div className="mt-[5px] h-[3px] bg-[#334155]" />
        </div>
        <div className="relative mb-7 flex items-end gap-2">
          <div className="h-14 w-2.5 rounded-sm bg-[#DC2626] sm:h-16 sm:w-3" />
          <div className="mb-8 h-1.5 w-24 origin-left rotate-[-16deg] rounded-full border border-red-400 bg-[#F8FAFC] sm:w-28" />
          <div className="h-7 w-7 rounded-sm bg-[#111827] sm:h-8 sm:w-8">
            <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-[#FACC15]" />
            <div className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      <div className="relative flex h-full w-[580px] shrink-0 items-end px-6 sm:px-8">
        <div className="absolute bottom-0 left-8 right-8 h-[54%]">
          <div className="absolute bottom-7 left-5 h-[68%] w-3 rounded-t-sm bg-[#94A3B8] sm:left-6 sm:w-4" />
          <div className="absolute bottom-7 right-5 h-[68%] w-3 rounded-t-sm bg-[#94A3B8] sm:right-6 sm:w-4" />
          <div className="absolute left-0 right-0 top-3 h-8 rounded-sm bg-[#CBD5E1] sm:top-4 sm:h-10" />
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

const WORLD = 500 + 880 + 940 + 720 + 400 + 580 + 500;

export default function HeroCityRide() {
  const bikeSrc = useEvuddySideSrc();
  const [viewW, setViewW] = useState(360);

  useEffect(() => {
    const read = () => setViewW(window.innerWidth);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  const travel = Math.max(WORLD - Math.min(viewW, 1280), 900);

  return (
    <div className="relative mx-auto mt-5 w-full max-w-[1280px] overflow-hidden rounded-[20px] border border-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:mt-8 sm:rounded-[32px]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -140px 0; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.92) 0 28px, transparent 28px 58px);
          animation: evuddy-drive 0.4s linear infinite;
        }
        .evuddy-tiles {
          background-image: repeating-linear-gradient(90deg, #E7E5E4 0 14px, #D6D3D1 14px 15px);
        }
        .evuddy-city-bike {
          width: 128px;
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          background: transparent;
          filter: drop-shadow(0 8px 8px rgba(15,23,42,0.22));
        }
        @media (min-width: 640px) {
          .evuddy-city-bike { width: 190px; }
        }
        @media (min-width: 1024px) {
          .evuddy-city-bike { width: 220px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive { animation: none !important; }
        }
      `}</style>

      <div className="relative h-[230px] overflow-hidden sm:h-[360px] lg:h-[440px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#8ECFFF_0%,#D7EEFF_34%,#F4FAF7_58%,#C8DCCF_100%)]" />
        <div className="absolute right-[12%] top-5 h-8 w-8 rounded-full bg-[#FFE08A] sm:top-7 sm:h-14 sm:w-14" />
        <motion.div
          className="absolute inset-x-0 top-6 h-8 sm:top-8 sm:h-10"
          animate={{ x: ["0%", "-12%", "0%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-[8%] h-5 w-16 rounded-full bg-white/80 sm:h-7 sm:w-24" />
          <div className="absolute left-[40%] top-1 h-6 w-24 rounded-full bg-white/70 sm:h-8 sm:w-32" />
          <div className="absolute left-[68%] h-4 w-14 rounded-full bg-white/75 sm:h-6 sm:w-20" />
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 h-full"
          style={{ width: WORLD }}
          animate={{ x: [0, -travel, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[58px] bg-gradient-to-b from-[#6B7280] to-[#3F4651] sm:h-[96px] lg:h-[110px]">
            <div className="absolute inset-x-0 top-0 h-2 bg-[#9CA3AF] sm:h-3" />
            <div className="evuddy-drive absolute inset-x-0 top-[44%] h-[4px] sm:h-[5px]" />
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#1F2937]/40" />
          </div>
          <div className="evuddy-tiles absolute inset-x-0 bottom-[58px] h-[14px] sm:bottom-[96px] sm:h-[18px] lg:bottom-[110px]" />
          <div className="absolute inset-x-0 bottom-[72px] top-8 flex items-stretch sm:bottom-[114px] lg:bottom-[128px]">
            <Ecosystem />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-[8px] left-[12%] z-20 origin-[center_bottom] sm:bottom-[14px] sm:left-[18%] lg:bottom-[16px]"
          animate={{ scaleX: [-1, -1, 1, 1, -1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", times: [0, 0.46, 0.5, 0.96, 1] }}
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
