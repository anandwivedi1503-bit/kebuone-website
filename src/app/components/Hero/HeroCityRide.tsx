"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

const beats = [
  { title: "Out from the yard", text: "Charged at the EVUDDY hub, the scooter rolls onto the street." },
  { title: "Homes and trees", text: "Quiet lanes, everyday houses, and a tree-lined ride." },
  { title: "Shops on the way", text: "Local stores, a cafe, and a charge point on the same road." },
  { title: "Crossing and flyover", text: "Past the railway gate, under the bridge, then the city opens up." },
  { title: "Back to the yard", text: "Ride done. The scooter returns home for the next booking." },
];

function Tree({ size = 1 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ transform: `scale(${size})`, transformOrigin: "bottom" }}>
      <div className="h-11 w-11 rounded-full bg-[#3F9A4F] shadow-[inset_-6px_-4px_0_rgba(0,0,0,0.08)]" />
      <div className="-mt-1 h-9 w-[7px] rounded-full bg-[#7A4A22]" />
    </div>
  );
}

function House({ wall, roof }: { wall: string; roof: string }) {
  return (
    <div className="relative w-[92px] shrink-0">
      <div
        className="absolute -top-7 left-[-6px] right-[-6px] h-8"
        style={{ background: roof, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
      />
      <div className="relative h-[72px] overflow-hidden rounded-sm" style={{ background: wall }}>
        <div className="absolute left-3 top-4 h-[14px] w-[14px] bg-[#7DD3FC]" />
        <div className="absolute right-3 top-4 h-[14px] w-[14px] bg-[#7DD3FC]" />
        <div className="absolute bottom-0 left-1/2 h-7 w-5 -translate-x-1/2 bg-[#9A3412]" />
      </div>
    </div>
  );
}

function Shop({ name, stripe }: { name: string; stripe: string }) {
  return (
    <div className="relative w-[118px] shrink-0">
      <div
        className="h-3"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${stripe} 0 12px, #fff 12px 22px)`,
        }}
      />
      <div className="h-[78px] rounded-b-sm bg-white shadow-[0_8px_16px_rgba(15,23,42,0.06)]">
        <p className="pt-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#0F172A]">
          {name}
        </p>
        <div className="mx-3 mt-2 h-8 rounded-sm bg-[#E0F2FE]" />
      </div>
    </div>
  );
}

function Yard({ label }: { label: string }) {
  return (
    <div className="relative flex h-full w-[520px] shrink-0 items-end px-6">
      <div className="absolute inset-x-4 bottom-0 top-8 rounded-t-[28px] border border-white/70 bg-white/55" />
      <div className="relative mb-2 w-full">
        <div className="mx-auto h-[118px] max-w-[280px] rounded-t-[22px] bg-white shadow-[0_14px_30px_rgba(24,179,104,0.12)]">
          <div className="mx-6 mt-5 h-2 rounded-full bg-[#18B368]" />
          <p className="mt-6 text-center text-[11px] font-black uppercase tracking-[0.22em] text-[#18B368]">
            {label}
          </p>
          <div className="mx-auto mt-4 flex w-40 justify-center gap-2">
            {[0, 1, 2, 3].map((n) => (
              <span key={n} className="h-8 w-2 rounded-full bg-[#86EFAC]" />
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-6">
          <Tree size={0.8} />
          <Tree size={1} />
        </div>
      </div>
    </div>
  );
}

function Ecosystem() {
  return (
    <>
      <Yard label="EVUDDY Yard" />

      <div className="relative flex h-full w-[860px] shrink-0 items-end gap-5 px-8 pb-1">
        <Tree size={1.1} />
        <House wall="#FFF7ED" roof="#EA580C" />
        <Tree size={0.85} />
        <House wall="#F8FAFC" roof="#0F766E" />
        <House wall="#FDF2F8" roof="#BE185D" />
        <Tree size={1} />
        <House wall="#EFF6FF" roof="#1D4ED8" />
        <Tree size={0.9} />
      </div>

      <div className="relative flex h-full w-[820px] shrink-0 items-end gap-4 px-6 pb-1">
        <Tree size={0.75} />
        <Shop name="Daily Mart" stripe="#18B368" />
        <Shop name="Cafe Leaf" stripe="#EC2A8C" />
        <Shop name="Phone Fix" stripe="#0EA5E9" />
        <div className="relative w-[90px] shrink-0">
          <div className="h-[86px] rounded-sm bg-[#0F172A]">
            <p className="pt-3 text-center text-[9px] font-black uppercase tracking-[0.14em] text-[#6EE7A8]">
              EV Charge
            </p>
            <div className="mx-auto mt-3 h-8 w-8 rounded-full border-4 border-[#18B368]" />
          </div>
        </div>
        <Tree size={0.95} />
      </div>

      <div className="relative flex h-full w-[460px] shrink-0 items-end justify-center px-4">
        <div className="absolute bottom-[-22%] left-6 right-6 z-20">
          <div className="h-[3px] bg-[#334155]" />
          <div className="mt-[6px] h-[3px] bg-[#334155]" />
          <div className="mt-[6px] h-[3px] bg-[#334155]" />
        </div>
        <div className="relative mb-10 flex items-end gap-3">
          <div className="h-16 w-3 rounded-sm bg-[#DC2626]" />
          <div className="mb-10 h-2 w-28 origin-left rounded-full bg-[#F8FAFC] shadow-sm rotate-[-18deg] border border-red-400" />
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#B91C1C]">
              Railway crossing
            </p>
            <div className="h-8 w-8 rounded-sm bg-[#111827]">
              <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#FACC15]" />
              <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#22C55E]" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex h-full w-[640px] shrink-0 items-end px-8">
        <div className="absolute bottom-0 left-10 right-10 z-30 h-[58%]">
          <div className="absolute bottom-8 left-6 h-[70%] w-4 rounded-t-sm bg-[#94A3B8]" />
          <div className="absolute bottom-8 right-6 h-[70%] w-4 rounded-t-sm bg-[#94A3B8]" />
          <div className="absolute left-0 right-0 top-4 h-10 rounded-sm bg-[#CBD5E1] shadow-[0_8px_18px_rgba(15,23,42,0.12)]" />
          <p className="absolute left-0 right-0 top-6 text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Flyover
          </p>
        </div>
        <div className="relative z-10 mb-2 flex w-full justify-between px-16">
          <Tree size={0.7} />
          <Tree size={0.8} />
        </div>
      </div>

      <Yard label="EVUDDY Yard" />
    </>
  );
}

export default function HeroCityRide() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const worldX = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "-75%", "0%"]);
  const cloudX = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const flip = useTransform(scrollYProgress, [0.48, 0.54], [1, -1]);
  const bikeX = useTransform(scrollYProgress, [0, 0.08, 0.5, 0.92, 1], ["10%", "26%", "30%", "26%", "10%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const along = value <= 0.5 ? value * 2 : (1 - value) * 2;
    if (value > 0.88) setBeat(4);
    else if (along < 0.16) setBeat(0);
    else if (along < 0.4) setBeat(1);
    else if (along < 0.66) setBeat(2);
    else setBeat(3);
  });

  return (
    <div ref={ref} className="relative left-1/2 mt-8 h-[340vh] w-screen -translate-x-1/2 sm:mt-10 sm:h-[360vh]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -140px 0; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(90deg, #fff 0 36px, transparent 36px 72px);
          animation: evuddy-drive 0.38s linear infinite;
        }
        .evuddy-city-bike {
          width: min(58vw, 300px);
          height: auto;
          max-width: none;
          max-height: none;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 16px 16px rgba(15,23,42,0.18));
        }
        @media (max-width: 640px) {
          .evuddy-city-bike { width: min(70vw, 220px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive { animation: none !important; }
        }
      `}</style>

      <div className="sticky top-[4.5rem] h-[calc(100svh-4.5rem)] overflow-hidden sm:top-20 sm:h-[calc(100svh-5rem)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#8ECFFF_0%,#D7EEFF_32%,#F4FAF7_58%,#C8DCCF_100%)]" />
        <div className="absolute right-[15%] top-9 h-[4.25rem] w-[4.25rem] rounded-full bg-[#FFE08A]" />
        <motion.div className="absolute inset-x-0 top-12 h-12" style={{ x: cloudX }}>
          <div className="absolute left-[8%] h-8 w-28 rounded-full bg-white/80" />
          <div className="absolute left-[36%] top-2 h-10 w-40 rounded-full bg-white/70" />
          <div className="absolute left-[62%] h-7 w-24 rounded-full bg-white/75" />
        </motion.div>

        <motion.div className="absolute inset-y-0 left-0 w-[400%]" style={{ x: worldX }}>
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#6B7280]">
            <div className="absolute inset-x-0 top-0 h-[18%] bg-[#9CA3AF]" />
            <div className="evuddy-drive absolute inset-x-0 top-[46%] h-[6px]" />
          </div>
          <div className="absolute inset-x-0 bottom-[22%] h-[5%] bg-[#D6D3D1]" />
          <div className="absolute inset-x-0 bottom-[27%] h-[46%] flex items-stretch">
            <Ecosystem />
          </div>
        </motion.div>

        <motion.div className="absolute z-20" style={{ left: bikeX, bottom: "8%", scaleX: flip }}>
          <img
            src="/evuddy-scooter.png"
            alt="EVUDDY electric scooter"
            className="evuddy-city-bike"
          />
        </motion.div>

        <div className="absolute bottom-4 left-1/2 z-30 w-[min(92%,36rem)] -translate-x-1/2 rounded-2xl bg-white/80 px-4 py-3 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-6">
          <p className="text-sm font-black text-[#0F172A] sm:text-lg">{beats[beat].title}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">{beats[beat].text}</p>
        </div>
      </div>
    </div>
  );
}
