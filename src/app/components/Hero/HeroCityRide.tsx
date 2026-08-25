"use client";

import { useId, useSyncExternalStore } from "react";
import { useEvuddySideSrc } from "./useEvuddySideSrc";

/** Classic 2:1 isometric — BatterySmart-style city, EVUDDY branding. */
const OX = 640;
const OY = 86;
const UX = 30;
const UY = 15;
const VB_W = 1280;
const VB_H = 620;

function iso(x: number, y: number) {
  return { x: OX + (x - y) * UX, y: OY + (x + y) * UY };
}

function diamond(x: number, y: number, s = 1) {
  const a = iso(x, y);
  const b = iso(x + s, y);
  const c = iso(x + s, y + s);
  const d = iso(x, y + s);
  return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
}

function isoLine(points: Array<[number, number]>) {
  return points
    .map(([x, y], i) => {
      const p = iso(x, y);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ");
}

function Box({
  x,
  y,
  w,
  d,
  h,
  top,
  left,
  right,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
}) {
  const p = [iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)];
  const q = p.map((pt) => ({ x: pt.x, y: pt.y - h }));
  return (
    <g>
      <polygon
        points={`${p[3].x},${p[3].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={left}
      />
      <polygon
        points={`${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[1].x},${q[1].y}`}
        fill={right}
      />
      <polygon
        points={`${q[0].x},${q[0].y} ${q[1].x},${q[1].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={top}
      />
    </g>
  );
}

function Windows({
  x,
  y,
  cols,
  rows,
  h,
  tone = "#D6E6F5",
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  h: number;
  tone?: string;
}) {
  const origin = iso(x + 0.18, y + 0.12);
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      items.push(
        <rect
          key={`${r}-${c}`}
          x={origin.x + 5 + c * 8}
          y={origin.y - h + 10 + r * 11}
          width="5.5"
          height="7"
          rx="0.8"
          fill={tone}
        />
      );
    }
  }
  return <g opacity="0.95">{items}</g>;
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${scale})`}>
      <ellipse cx="0" cy="4" rx="11" ry="4" fill="rgba(15,23,42,0.08)" />
      <ellipse cx="0" cy="-14" rx="14" ry="12" fill="#2F9E57" />
      <ellipse cx="4" cy="-20" rx="9" ry="7" fill="#4ECB71" />
    </g>
  );
}

function Person({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <ellipse cx="0" cy="3" rx="5" ry="2" fill="rgba(15,23,42,0.12)" />
      <rect x="-2.4" y="-14" width="4.8" height="11" rx="1.6" fill={shirt} />
      <circle cx="0" cy="-18" r="3.2" fill="#F3C6A4" />
      <rect x="-2.2" y="-4" width="1.9" height="7" rx="0.8" fill="#1E3A5F" />
      <rect x="0.4" y="-4" width="1.9" height="7" rx="0.8" fill="#1E3A5F" />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#E8EEF4" opacity="0.9">
      <ellipse cx="0" cy="0" rx="22" ry="10" />
      <ellipse cx="14" cy="-2" rx="16" ry="9" />
      <ellipse cx="-12" cy="1" rx="12" ry="7" />
    </g>
  );
}

/** Tall locker-style hub, in the BatterySmart station language. */
function HubKiosk({
  x,
  y,
  label,
  glow,
}: {
  x: number;
  y: number;
  label: string;
  glow: string;
}) {
  const face = iso(x + 1.05, y + 0.15);
  return (
    <g>
      <Box x={x} y={y} w={1.15} d={1.05} h={72} top="#1B4F86" left="#0D2A4A" right="#16406C" />
      <Box x={x + 0.12} y={y + 0.08} w={0.9} d={0.88} h={8} top={glow} left="#0B3B22" right="#147A45" />
      {[0, 1, 2, 3].map((n) => (
        <rect
          key={n}
          className="evuddy-iso-slot"
          x={face.x + 6}
          y={face.y - 62 + n * 13}
          width="16"
          height="8"
          rx="1.4"
          fill={glow}
          opacity="0.95"
        />
      ))}
      <text
        x={iso(x + 0.55, y + 0.4).x}
        y={iso(x + 0.55, y + 0.4).y - 78}
        textAnchor="middle"
        fill="#0F172A"
        fontSize="8"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

function ParkedScooter({
  src,
  x,
  y,
  scale = 0.072,
}: {
  src: string;
  x: number;
  y: number;
  scale?: number;
}) {
  const p = iso(x, y);
  const w = 520 * scale;
  const h = 290 * scale;
  return (
    <image
      href={src}
      x={p.x - w * 0.5}
      y={p.y - h * 0.86}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      style={{ filter: "drop-shadow(3px 5px 4px rgba(15,23,42,0.16))" }}
    />
  );
}

function MovingScooter({
  src,
  pathId,
  dur,
  delay,
  scale = 0.078,
  flip,
  reduced,
}: {
  src: string;
  pathId: string;
  dur: string;
  delay: string;
  scale?: number;
  flip?: boolean;
  reduced: boolean;
}) {
  const w = 520 * scale;
  const h = 290 * scale;
  if (reduced) return null;

  return (
    <g>
      <animateMotion dur={dur} begin={delay} repeatCount="indefinite" rotate="0">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <g transform={flip ? "scale(-1 1)" : undefined}>
        <image
          href={src}
          x={-w * 0.5}
          y={-h * 0.86}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: "drop-shadow(3px 5px 4px rgba(15,23,42,0.16))" }}
        />
      </g>
    </g>
  );
}

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function Callout({
  className,
  title,
  delay,
}: {
  className: string;
  title: string;
  delay: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-10 ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="evuddy-iso-callout rounded-2xl border border-slate-100/90 bg-white px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.10)] sm:px-3.5 sm:py-2.5">
        <p className="max-w-[16ch] text-[10px] font-bold leading-snug tracking-tight text-[#0F172A] sm:text-[11px]">
          {title}
        </p>
      </div>
      <div className="mx-6 h-2 w-2 rotate-45 -translate-y-1 border-b border-r border-slate-100 bg-white" />
    </div>
  );
}

export default function HeroCityRide() {
  const src = useEvuddySideSrc();
  const uid = useId().replace(/:/g, "");
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  const avenue = isoLine([
    [0.4, 8.15],
    [18.6, 8.15],
  ]);
  const cross = isoLine([
    [9.15, 1.2],
    [9.15, 14.6],
  ]);
  const loop = isoLine([
    [3.2, 8.15],
    [9.15, 8.15],
    [9.15, 12.4],
    [14.8, 12.4],
    [14.8, 8.15],
    [9.15, 8.15],
    [3.2, 8.15],
  ]);

  const roadFill = (x0: number, y0: number, x1: number, y1: number) => {
    const a = iso(x0, y0);
    const b = iso(x1, y0);
    const c = iso(x1, y1);
    const d = iso(x0, y1);
    return `${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
  };

  return (
    <div className="relative mx-auto mt-4 w-full max-w-[1280px] sm:mt-6">
      <style>{`
        @keyframes evuddy-iso-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes evuddy-iso-cloud {
          0% { transform: translateX(0); }
          50% { transform: translateX(18px); }
          100% { transform: translateX(0); }
        }
        @keyframes evuddy-iso-slot {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes evuddy-iso-callout {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .evuddy-iso-scene { animation: evuddy-iso-bob 7s ease-in-out infinite; }
        .evuddy-iso-clouds { animation: evuddy-iso-cloud 16s ease-in-out infinite; }
        .evuddy-iso-slot { animation: evuddy-iso-slot 1.8s ease-in-out infinite; }
        .evuddy-iso-callout { animation: evuddy-iso-callout 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-iso-scene, .evuddy-iso-clouds, .evuddy-iso-slot, .evuddy-iso-callout {
            animation: none !important;
          }
        }
      `}</style>

      <div className="relative h-[250px] overflow-hidden sm:h-[400px] lg:h-[500px]">
        <Callout
          className="left-[6%] top-[14%] sm:left-[8%] sm:top-[16%]"
          title="Hourly to monthly EV rentals"
          delay="0s"
        />
        <Callout
          className="right-[4%] top-[22%] sm:right-[10%] sm:top-[18%]"
          title="Dense EVUDDY hub & yard network"
          delay="0.6s"
        />
        <Callout
          className="bottom-[18%] left-[10%] hidden sm:block sm:bottom-[16%] sm:left-[14%]"
          title="Pickup OTP · GPS-tracked rides"
          delay="1.1s"
        />

        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="evuddy-iso-scene absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F4F8FB" />
            </linearGradient>
          </defs>

          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sky)`} />

          {[-6, -2, 2, 6, 10, 14, 18].map((gx) =>
            [-2, 2, 6, 10, 14].map((gy) => (
              <polygon
                key={`${gx}-${gy}`}
                points={diamond(gx, gy, 4)}
                fill="none"
                stroke="rgba(148,163,184,0.13)"
                strokeWidth="1"
              />
            ))
          )}

          <g className="evuddy-iso-clouds">
            <Cloud x={180} y={70} s={1.1} />
            <Cloud x={980} y={58} s={0.9} />
            <Cloud x={560} y={42} s={0.7} />
          </g>

          {/* Ground pads */}
          <polygon points={diamond(1.2, 1.4, 3.6)} fill="#EEF5EA" />
          <polygon points={diamond(12.4, 10.6, 3.2)} fill="#E8F6EE" />

          {/* Road network */}
          <polygon points={roadFill(0.2, 7.35, 18.8, 8.95)} fill="#D7E4F0" />
          <polygon points={roadFill(8.35, 1.0, 9.95, 14.9)} fill="#D7E4F0" />
          <polygon points={roadFill(9.9, 11.7, 15.4, 13.15)} fill="#D7E4F0" />

          <path d={avenue} fill="none" stroke="#fff" strokeWidth="2.2" strokeDasharray="12 14" strokeLinecap="round" />
          <path d={cross} fill="none" stroke="#fff" strokeWidth="2.2" strokeDasharray="12 14" strokeLinecap="round" />
          <path
            d={isoLine([
              [9.9, 12.4],
              [15.2, 12.4],
            ])}
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="10 12"
            strokeLinecap="round"
          />

          <path id={`${uid}-ave`} d={avenue} fill="none" />
          <path id={`${uid}-cross`} d={cross} fill="none" />
          <path id={`${uid}-loop`} d={loop} fill="none" />

          {/* North / west buildings */}
          <Box x={1.4} y={2.1} w={2.4} d={1.5} h={86} top="#F3F7FB" left="#C9D9EA" right="#7EA0C4" />
          <Windows x={1.4} y={2.1} cols={5} rows={4} h={86} />

          <Box x={4.2} y={1.8} w={2.6} d={1.6} h={112} top="#EEF4FA" left="#B9D0E6" right="#5B86B3" />
          <Windows x={4.2} y={1.8} cols={5} rows={6} h={112} />

          <Box x={11.2} y={2.0} w={2.5} d={1.45} h={78} top="#F7FAFC" left="#D5E2EE" right="#8AA7C2" />
          <Windows x={11.2} y={2.0} cols={5} rows={4} h={78} />

          <Box x={14.2} y={1.6} w={2.7} d={1.7} h={98} top="#F4F8FB" left="#C5D8EA" right="#6B93B8" />
          <Windows x={14.2} y={1.6} cols={5} rows={5} h={98} />

          <Box x={16.6} y={3.4} w={2.1} d={1.2} h={44} top="#ECFDF5" left="#BBF7D0" right="#18B368" />
          <Windows x={16.6} y={3.4} cols={4} rows={2} h={44} tone="#BBF7D0" />

          {/* South / east buildings */}
          <Box x={1.6} y={10.2} w={2.3} d={1.4} h={70} top="#F8FAFC" left="#D0DCE8" right="#7B93AA" />
          <Windows x={1.6} y={10.2} cols={4} rows={3} h={70} />

          <Box x={4.4} y={10.4} w={2.6} d={1.5} h={92} top="#EFF4FA" left="#BFD0E2" right="#5F82A8" />
          <Windows x={4.4} y={10.4} cols={5} rows={4} h={92} />

          <Box x={11.4} y={9.6} w={3.4} d={1.7} h={64} top="#ECFDF5" left="#86EFAC" right="#18B368" />
          <Windows x={11.4} y={9.6} cols={6} rows={2} h={64} tone="#BBF7D0" />
          <text
            x={iso(13.1, 10.1).x}
            y={iso(13.1, 10.1).y - 74}
            textAnchor="middle"
            fill="#0F172A"
            fontSize="10"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            EVUDDY HUB
          </text>

          <Box x={16.2} y={9.8} w={2.2} d={1.25} h={48} top="#FFF1F2" left="#FECDD3" right="#EC2A8C" />
          <Windows x={16.2} y={9.8} cols={4} rows={2} h={48} tone="#FECDD3" />

          {/* Pickup yard */}
          <polygon points={diamond(11.6, 4.15, 2.6)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <text
            x={iso(12.9, 4.3).x}
            y={iso(12.9, 4.3).y - 8}
            textAnchor="middle"
            fill="#334155"
            fontSize="8"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            YARD
          </text>

          <HubKiosk x={2.35} y={6.05} label="HUB" glow="#22C55E" />
          <HubKiosk x={15.55} y={6.1} label="HUB" glow="#4ADE80" />
          <HubKiosk x={7.05} y={12.55} label="YARD" glow="#18B368" />

          <Tree x={0.7} y={4.6} />
          <Tree x={7.2} y={3.2} scale={0.9} />
          <Tree x={10.6} y={3.4} />
          <Tree x={17.8} y={5.4} scale={0.85} />
          <Tree x={0.9} y={12.4} />
          <Tree x={7.4} y={10.8} />
          <Tree x={15.2} y={14.2} />
          <Tree x={18.4} y={11.2} scale={0.9} />

          <Person x={2.1} y={5.85} shirt="#18B368" />
          <Person x={3.7} y={6.9} shirt="#EC2A8C" />
          <Person x={12.2} y={5.5} shirt="#0EA5E9" />
          <Person x={13.4} y={11.6} shirt="#18B368" />
          <Person x={7.9} y={13.5} shirt="#F59E0B" />
          <Person x={16.8} y={7.0} shirt="#0F172A" />

          {src ? (
            <>
              <ParkedScooter src={src} x={12.1} y={5.35} />
              <ParkedScooter src={src} x={12.85} y={5.7} />
              <ParkedScooter src={src} x={13.55} y={6.05} />
              <MovingScooter src={src} pathId={`${uid}-ave`} dur="18s" delay="0s" reduced={reduced} />
              <MovingScooter src={src} pathId={`${uid}-ave`} dur="22s" delay="9s" flip reduced={reduced} />
              <MovingScooter src={src} pathId={`${uid}-cross`} dur="16s" delay="3s" reduced={reduced} />
              <MovingScooter src={src} pathId={`${uid}-loop`} dur="24s" delay="1s" scale={0.07} reduced={reduced} />
            </>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
