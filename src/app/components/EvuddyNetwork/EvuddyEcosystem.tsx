"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useEvuddySideSrc } from "../Hero/useEvuddySideSrc";

type BoxProps = {
  x: number;
  y: number;
  w: number;
  l: number;
  h: number;
  z?: number;
  top: string;
  front: string;
  side: string;
  children?: ReactNode;
  glow?: boolean;
};

function IsoBox({ x, y, w, l, h, z = 0, top, front, side, children, glow }: BoxProps) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: l,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z + h / 2}px)`,
        filter: glow ? "drop-shadow(0 0 18px rgba(24,179,104,0.55))" : undefined,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: top,
          transform: `translateZ(${h / 2}px)`,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
        }}
      />
      <div
        className="absolute left-0 flex items-center justify-center overflow-hidden"
        style={{
          width: w,
          height: h,
          background: front,
          transformOrigin: "center",
          transform: `rotateX(-90deg) translateZ(${l / 2}px)`,
        }}
      >
        {children}
      </div>
      <div
        className="absolute top-0"
        style={{
          width: l,
          height: h,
          background: side,
          transformOrigin: "center",
          transform: `rotateY(90deg) translateZ(${w / 2}px)`,
        }}
      />
    </div>
  );
}

function Windows({ cols = 3, rows = 4 }: { cols?: number; rows?: number }) {
  return (
    <div className="grid h-[72%] w-[78%] gap-[3px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <span key={i} className="rounded-[1px] bg-[#7DD3FC]/70" />
      ))}
    </div>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transformStyle: "preserve-3d" }}>
      <div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3F9A4F]"
        style={{ transform: "translateZ(28px) scale(2.4)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7A4A22]"
        style={{ transform: "translateZ(12px)" }}
      />
    </div>
  );
}

function BikeSprite({
  x,
  y,
  src,
  flip,
  delay = 0,
  ride,
}: {
  x: number;
  y: number;
  src: string;
  flip?: boolean;
  delay?: number;
  ride?: boolean;
}) {
  return (
    <motion.div
      className="absolute origin-bottom"
      style={{
        left: x,
        top: y,
        transformStyle: "preserve-3d",
        transform: "translateZ(8px) rotateZ(45deg) rotateX(-58deg)",
      }}
      animate={ride ? { x: [0, 220, 0] } : { x: 0 }}
      transition={ride ? { duration: 7, delay, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-auto w-[58px] max-w-none drop-shadow-[0_8px_8px_rgba(15,23,42,0.28)] sm:w-[72px]"
          style={{ transform: flip ? "scaleX(-1)" : undefined }}
        />
      ) : (
        <div
          className="h-4 w-12 rounded-full bg-[#EC2A8C]"
          style={{ transform: flip ? "scaleX(-1)" : undefined }}
        />
      )}
    </motion.div>
  );
}

export default function EvuddyEcosystem() {
  const [mode, setMode] = useState<"hub" | "ride">("hub");
  const bikeSrc = useEvuddySideSrc();
  const ride = mode === "ride";

  return (
    <div className="relative overflow-hidden bg-[#EEF2F6]">
      <style>{`
        .evuddy-iso-world {
          transform: rotateX(58deg) rotateZ(-45deg);
          transform-style: preserve-3d;
        }
        .evuddy-iso-grid {
          background-color: #F4F7F9;
          background-image:
            linear-gradient(90deg, rgba(148,163,184,0.28) 1px, transparent 1px),
            linear-gradient(rgba(148,163,184,0.28) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        @keyframes evuddy-hub-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
        .evuddy-hub-pulse { animation: evuddy-hub-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-hub-pulse { animation: none; }
        }
      `}</style>

      <div className="relative z-10 flex flex-wrap gap-2 px-4 pt-5 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={() => setMode("hub")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
            mode === "hub"
              ? "border-[#18B368] bg-white text-[#0F172A] shadow-sm"
              : "border-white/80 bg-white/70 text-slate-500"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />
          EVUDDY hub
        </button>
        <button
          type="button"
          onClick={() => setMode("ride")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
            mode === "ride"
              ? "border-[#EC2A8C] bg-white text-[#0F172A] shadow-sm"
              : "border-white/80 bg-white/70 text-slate-500"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#EC2A8C]" />
          Pickup + street ride
        </button>
        <p className="ml-auto hidden items-center text-xs font-semibold text-slate-400 sm:flex">
          {mode === "hub" ? "Swap-ready kiosk · OTP pickup" : "Yard out → live GPS → return"}
        </p>
      </div>

      <div
        className="relative mx-auto h-[340px] w-full max-w-[1100px] sm:h-[440px] lg:h-[520px]"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 46%" }}
      >
        <div
          className="evuddy-iso-world absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 sm:h-[520px] sm:w-[520px]"
        >
          <div className="evuddy-iso-grid absolute inset-0 rounded-[28px] shadow-[0_30px_60px_rgba(15,23,42,0.08)]" />

          {/* Main avenue */}
          <div
            className="absolute left-[18px] right-[18px] top-[236px] h-[72px] bg-[#8B95A1] sm:top-[292px] sm:h-[84px]"
            style={{ transform: "translateZ(1px)" }}
          >
            <div className="absolute inset-x-3 inset-y-[10px] bg-[#6B7280]" />
            <div className="absolute left-4 right-4 top-1/2 h-[3px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#fff_0_16px,transparent_16px_28px)]" />
            {ride ? (
              <div className="absolute left-4 right-4 top-[18%] h-[4px] bg-[#18B368] opacity-80 evuddy-hub-pulse" />
            ) : null}
          </div>

          {/* Cross street */}
          <div
            className="absolute bottom-[40px] left-[236px] top-[40px] w-[64px] bg-[#8B95A1] sm:left-[292px] sm:w-[72px]"
            style={{ transform: "translateZ(1px)" }}
          >
            <div className="absolute inset-x-[8px] inset-y-3 bg-[#6B7280]" />
          </div>

          {/* Pickup yard slab */}
          <div
            className="absolute left-[36px] top-[118px] h-[96px] w-[150px] bg-[#E2E8F0] sm:top-[148px]"
            style={{ transform: "translateZ(2px)" }}
          >
            <div className="absolute inset-[8px] border border-dashed border-[#18B368]/50 bg-[#F8FAFC]" />
          </div>

          <IsoBox x={58} y={42} w={58} l={58} h={78} top="#F8FBFF" front="#EEF4FA" side="#C5D6E6">
            <Windows cols={2} rows={3} />
          </IsoBox>
          <IsoBox x={128} y={36} w={52} l={52} h={102} top="#FFFFFF" front="#F4F7FB" side="#B7CBDC">
            <Windows cols={2} rows={4} />
          </IsoBox>
          <IsoBox x={318} y={48} w={62} l={54} h={118} top="#ECFDF3" front="#E8F8EE" side="#A7D4B8">
            <Windows cols={3} rows={4} />
          </IsoBox>
          <IsoBox x={392} y={58} w={50} l={48} h={86} top="#FFFFFF" front="#F7FAFC" side="#C5D6E4">
            <Windows cols={2} rows={3} />
          </IsoBox>
          <IsoBox x={328} y={338} w={70} l={58} h={64} top="#FFF1F7" front="#FCE7F1" side="#E8A0C0">
            <span className="text-[7px] font-black tracking-[0.14em] text-[#EC2A8C]">EV CHARGE</span>
          </IsoBox>
          <IsoBox x={28} y={338} w={78} l={62} h={52} top="#E2E8F0" front="#334155" side="#1E293B">
            <span className="text-[7px] font-black tracking-[0.12em] text-[#E2E8F0]">NAGAR STN</span>
          </IsoBox>

          {/* EVUDDY HUB — Battery Smart composition: green cube, dark HUB face */}
          <IsoBox
            x={214}
            y={318}
            w={86}
            l={78}
            h={118}
            top="#22C55E"
            front="#0F172A"
            side="#16A34A"
            glow={mode === "hub"}
          >
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black tracking-[0.22em] text-[#6EE7A8]">EVUDDY</span>
              <span className="text-[15px] font-black tracking-[0.28em] text-[#18B368]">HUB</span>
            </div>
          </IsoBox>
          <IsoBox x={206} y={310} w={102} l={94} h={14} z={118} top="#86EFAC" front="#16A34A" side="#15803D" />

          {mode === "hub" ? (
            <div
              className="evuddy-hub-pulse absolute h-24 w-24 rounded-full bg-[#18B368]"
              style={{ left: 208, top: 312, transform: "translateZ(2px)" }}
            />
          ) : null}

          <Tree x={48} y={88} />
          <Tree x={188} y={64} />
          <Tree x={400} y={120} />
          <Tree x={430} y={360} />
          <Tree x={90} y={400} />
          <Tree x={250} y={430} />

          <BikeSprite x={52} y={148} src={bikeSrc} />
          <BikeSprite x={96} y={168} src={bikeSrc} flip />
          <BikeSprite x={140} y={248} src={bikeSrc} ride={ride} delay={0} />
          <BikeSprite x={200} y={262} src={bikeSrc} flip ride={ride} delay={1.6} />
          <BikeSprite x={268} y={248} src={bikeSrc} ride={ride} delay={3.2} />
        </div>
      </div>
    </div>
  );
}
