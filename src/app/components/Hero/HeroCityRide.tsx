"use client";

import { motion } from "framer-motion";

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
        <div className="absolute bottom-[-38%] left-6 right-6 z-20">
          <div className="h-[3px] bg-[#334155]" />
          <div className="mt-[6px] h-[3px] bg-[#334155]" />
          <div className="mt-[6px] h-[3px] bg-[#334155]" />
        </div>
        <div className="relative mb-8 flex items-end gap-3">
          <div className="h-16 w-3 rounded-sm bg-[#DC2626]" />
          <div className="mb-10 h-2 w-28 origin-left rotate-[-18deg] rounded-full border border-red-400 bg-[#F8FAFC]" />
          <div className="h-8 w-8 rounded-sm bg-[#111827]">
            <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#FACC15]" />
            <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      <div className="relative flex h-full w-[640px] shrink-0 items-end px-8">
        <div className="absolute bottom-0 left-10 right-10 z-10 h-[58%]">
          <div className="absolute bottom-8 left-6 h-[70%] w-4 rounded-t-sm bg-[#94A3B8]" />
          <div className="absolute bottom-8 right-6 h-[70%] w-4 rounded-t-sm bg-[#94A3B8]" />
          <div className="absolute left-0 right-0 top-4 h-10 rounded-sm bg-[#CBD5E1]" />
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

function EvuddySideRide() {
  return (
    <svg
      className="evuddy-city-bike"
      viewBox="0 0 340 168"
      fill="none"
      aria-label="Cartoon rider on an EVUDDY scooter"
    >
      <ellipse cx="168" cy="160" rx="108" ry="7" fill="rgba(15,23,42,0.16)" />

      <g>
        <circle cx="78" cy="128" r="30" fill="#111827" />
        <circle cx="78" cy="128" r="20" fill="#1F2937" />
        <circle cx="78" cy="128" r="7" fill="#6EE7A8" />
        <path d="M78 108 V148 M58 128 H98" stroke="#374151" strokeWidth="3" />
        <animateTransform attributeName="transform" type="rotate" from="0 78 128" to="360 78 128" dur="0.55s" repeatCount="indefinite" />
      </g>
      <g>
        <circle cx="258" cy="128" r="30" fill="#111827" />
        <circle cx="258" cy="128" r="20" fill="#1F2937" />
        <circle cx="258" cy="128" r="7" fill="#6EE7A8" />
        <path d="M258 108 V148 M238 128 H278" stroke="#374151" strokeWidth="3" />
        <animateTransform attributeName="transform" type="rotate" from="0 258 128" to="360 258 128" dur="0.55s" repeatCount="indefinite" />
      </g>

      <path d="M96 118 H214" stroke="#111827" strokeWidth="10" strokeLinecap="round" />
      <path d="M108 112 H168 Q190 112 206 92" stroke="#EC2A8C" strokeWidth="16" strokeLinecap="round" />
      <path d="M168 108 Q186 78 214 70" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" />
      <rect x="118" y="78" width="62" height="14" rx="7" fill="#111827" />
      <path d="M206 92 L248 58" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
      <circle cx="252" cy="54" r="11" fill="#F8FAFC" stroke="#EC2A8C" strokeWidth="4" />
      <rect x="236" y="48" width="22" height="7" rx="3" fill="#111827" />
      <path d="M168 108 L176 128" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" />
      <rect x="128" y="94" width="36" height="10" rx="2" fill="#FFFFFF" />
      <text x="146" y="102" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="Arial, sans-serif">
        <tspan fill="#18B368">EV</tspan>
        <tspan fill="#EC2A8C">UDDY</tspan>
      </text>
      <path d="M248 58 L268 52" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      <circle cx="274" cy="50" r="5" fill="#111827" />

      <g>
        <path d="M156 92 L128 118" stroke="#1E3A5F" strokeWidth="8" strokeLinecap="round" />
        <path d="M148 92 L118 118" stroke="#1E3A5F" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="122" cy="120" rx="9" ry="5" fill="#111827" />
        <ellipse cx="132" cy="120" rx="9" ry="5" fill="#111827" />
        <path d="M150 78 Q168 62 214 56" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" />
        <rect x="138" y="58" width="36" height="34" rx="12" fill="#18B368" />
        <circle cx="168" cy="46" r="14" fill="#F8C9A8" />
        <path d="M154 42 Q168 28 184 42 Q184 54 168 56 Q152 54 154 42" fill="#EC2A8C" />
        <path d="M176 38 Q186 32 192 40" stroke="#EC2A8C" strokeWidth="4" strokeLinecap="round" />
        <circle cx="164" cy="46" r="1.6" fill="#0F172A" />
        <circle cx="172" cy="46" r="1.6" fill="#0F172A" />
        <path d="M164 51 Q168 53 172 51" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const WORLD = 520 + 860 + 820 + 460 + 640 + 520;

export default function HeroCityRide() {
  return (
    <div className="relative mx-auto mt-7 w-full max-w-[1280px] overflow-hidden rounded-[24px] border border-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:mt-8 sm:rounded-[32px]">
      <style>{`
        @keyframes evuddy-drive {
          to { background-position: -140px 0; }
        }
        .evuddy-drive {
          background-image: repeating-linear-gradient(90deg, #fff 0 36px, transparent 36px 72px);
          animation: evuddy-drive 0.38s linear infinite;
        }
        .evuddy-city-bike {
          width: 168px;
          height: auto;
          max-width: none;
          max-height: none;
          display: block;
          overflow: visible;
        }
        @media (min-width: 640px) {
          .evuddy-city-bike { width: 210px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-drive { animation: none !important; }
        }
      `}</style>

      <div className="relative h-[340px] overflow-hidden sm:h-[420px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#8ECFFF_0%,#D7EEFF_34%,#F4FAF7_60%,#C8DCCF_100%)]" />
        <div className="absolute right-[14%] top-7 h-12 w-12 rounded-full bg-[#FFE08A] sm:h-14 sm:w-14" />
        <motion.div
          className="absolute inset-x-0 top-8 h-10"
          animate={{ x: ["0%", "-12%", "0%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-[8%] h-7 w-24 rounded-full bg-white/80" />
          <div className="absolute left-[40%] top-2 h-8 w-32 rounded-full bg-white/70" />
          <div className="absolute left-[68%] h-6 w-20 rounded-full bg-white/75" />
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 h-full"
          style={{ width: WORLD }}
          animate={{ x: [0, -(WORLD - 720), 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[86px] bg-[#6B7280] sm:h-[102px]">
            <div className="absolute inset-x-0 top-0 h-4 bg-[#9CA3AF]" />
            <div className="evuddy-drive absolute inset-x-0 top-[46%] h-[5px]" />
          </div>
          <div className="absolute inset-x-0 bottom-[86px] h-[18px] bg-[#D6D3D1] sm:bottom-[102px]" />
          <div className="absolute inset-x-0 bottom-[104px] top-10 flex items-stretch sm:bottom-[120px]">
            <Ecosystem />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-[18px] left-[14%] z-20 origin-center sm:bottom-[22px] sm:left-[16%]"
          animate={{ scaleX: [1, 1, -1, -1, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear", times: [0, 0.46, 0.5, 0.96, 1] }}
        >
          <EvuddySideRide />
        </motion.div>
      </div>
    </div>
  );
}
