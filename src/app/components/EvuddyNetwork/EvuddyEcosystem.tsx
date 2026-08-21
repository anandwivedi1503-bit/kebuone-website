"use client";

import { useId, useState } from "react";
import { useEvuddySideSrc } from "../Hero/useEvuddySideSrc";

/**
 * Full-width EVUDDY operations strip.
 *
 * Why it used to look “squeezed”: a 1440×820 viewBox inside a short band
 * scales by HEIGHT, so the city sat in the middle third with empty sides.
 *
 * Fix: wide shallow viewBox + preserveAspectRatio slice so the scene always
 * fills the viewport width. Expand on hover/click to show more height.
 *
 * Scooters only on the avenue, pickup yard, and charge bays — never on the hub roof.
 */

const OX = 960;
const OY = 70;
const UX = 38;
const UY = 16;

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

function Box({
  x,
  y,
  w,
  d,
  h,
  top,
  left,
  right,
  stroke = "rgba(15,23,42,0.1)",
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
  stroke?: string;
}) {
  const p = [
    iso(x, y),
    iso(x + w, y),
    iso(x + w, y + d),
    iso(x, y + d),
  ];
  const q = p.map((pt) => ({ x: pt.x, y: pt.y - h }));
  return (
    <g>
      <polygon
        points={`${p[3].x},${p[3].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={left}
        stroke={stroke}
        strokeWidth="0.6"
      />
      <polygon
        points={`${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${q[2].x},${q[2].y} ${q[1].x},${q[1].y}`}
        fill={right}
        stroke={stroke}
        strokeWidth="0.6"
      />
      <polygon
        points={`${q[0].x},${q[0].y} ${q[1].x},${q[1].y} ${q[2].x},${q[2].y} ${q[3].x},${q[3].y}`}
        fill={top}
        stroke={stroke}
        strokeWidth="0.6"
      />
    </g>
  );
}

function RoofSolar({ x, y, elev }: { x: number; y: number; elev: number }) {
  const origin = iso(x, y);
  return (
    <g transform={`translate(${origin.x} ${origin.y - elev})`}>
      <polygon points="-28,-6 10,-22 48,-6 10,10" fill="#0B3B22" />
      {[-18, -6, 6].map((dx) => (
        <g key={dx}>
          <polygon
            points={`${dx},-2 ${dx + 12},-8 ${dx + 22},-2 ${dx + 10},4`}
            fill="#14532D"
            stroke="#86EFAC"
            strokeWidth="0.7"
          />
          <line
            x1={dx + 4}
            y1={-4}
            x2={dx + 16}
            y2={0}
            stroke="#4ADE80"
            strokeWidth="0.5"
            opacity="0.7"
          />
        </g>
      ))}
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.x} cy={p.y + 6} rx="11" ry="4" fill="rgba(15,23,42,0.1)" />
      <rect x={p.x - 2.5} y={p.y - 14} width="5" height="18" rx="1.5" fill="#7C4A2A" />
      <ellipse cx={p.x} cy={p.y - 22} rx="16" ry="13" fill="#166534" />
      <ellipse cx={p.x + 5} cy={p.y - 28} rx="11" ry="9" fill="#22C55E" />
      <ellipse cx={p.x - 6} cy={p.y - 26} rx="9" ry="7" fill="#15803D" />
    </g>
  );
}

function Person({
  x,
  y,
  shirt,
  flip,
}: {
  x: number;
  y: number;
  shirt: string;
  flip?: boolean;
}) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="0" cy="4" rx="7" ry="2.4" fill="rgba(15,23,42,0.14)" />
      <rect x="-3.2" y="-18" width="6.4" height="14" rx="2.4" fill={shirt} />
      <circle cx="0" cy="-23" r="4.4" fill="#F4C7A5" />
      <rect x="-5" y="-16" width="3.2" height="8" rx="1.4" fill={shirt} />
      <rect x="1.8" y="-16" width="3.2" height="8" rx="1.4" fill={shirt} />
      <rect x="-3" y="-5" width="2.6" height="9" rx="1.2" fill="#1E3A5F" />
      <rect x="0.6" y="-5" width="2.6" height="9" rx="1.2" fill="#1E3A5F" />
    </g>
  );
}

function ChargePost({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.x} cy={p.y + 4} rx="10" ry="3.5" fill="rgba(15,23,42,0.12)" />
      <rect x={p.x - 7} y={p.y - 28} width="14" height="30" rx="3" fill="#0F172A" />
      <rect x={p.x - 5} y={p.y - 24} width="10" height="8" rx="1.5" fill="#18B368" />
      <text
        x={p.x}
        y={p.y - 18}
        textAnchor="middle"
        fill="#fff"
        fontSize="5.5"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        EV
      </text>
      <rect x={p.x + 6} y={p.y - 16} width="10" height="2.5" rx="1" fill="#94A3B8" />
      <circle cx={p.x} cy={p.y - 32} r="3.2" fill="#EC2A8C" />
    </g>
  );
}

function Windows({
  x,
  y,
  cols,
  rows,
  h,
  tone = "#BFDBFE",
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  h: number;
  tone?: string;
}) {
  const origin = iso(x, y);
  const items = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      items.push(
        <rect
          key={`${r}-${c}`}
          x={origin.x + 8 + c * 11 - r * 1.5}
          y={origin.y - h + 10 + r * 14}
          width="7"
          height="9"
          rx="1"
          fill={tone}
          opacity="0.9"
        />
      );
    }
  }
  return <g>{items}</g>;
}

function RealScooter({
  src,
  x,
  y,
  scale = 0.2,
  flip,
}: {
  src: string;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) {
  const p = iso(x, y);
  const w = 520 * scale;
  const h = 290 * scale;
  return (
    <image
      href={src}
      x={p.x - w * 0.52}
      y={p.y - h * 0.88}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      transform={flip ? `translate(${p.x} ${p.y}) scale(-1 1) translate(${-p.x} ${-p.y})` : undefined}
      style={{ filter: "drop-shadow(8px 10px 8px rgba(15,23,42,0.22))" }}
    />
  );
}

function MovingScooter({
  src,
  pathId,
  dur,
  delay,
  scale = 0.17,
}: {
  src: string;
  pathId: string;
  dur: string;
  delay: string;
  scale?: number;
}) {
  const w = 520 * scale;
  const h = 290 * scale;
  return (
    <g>
      <image
        href={src}
        x={-w * 0.5}
        y={-h * 0.86}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: "drop-shadow(6px 8px 7px rgba(15,23,42,0.2))" }}
      >
        <animateMotion dur={dur} begin={delay} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </image>
    </g>
  );
}

export default function EvuddyEcosystem() {
  const src = useEvuddySideSrc();
  const uid = useId().replace(/:/g, "");
  const roadId = `${uid}-road`;
  const [expanded, setExpanded] = useState(false);

  const a0 = iso(-7.2, 5.35);
  const a1 = iso(20.4, 5.35);

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#EEF3F8] transition-[height] duration-500 ease-out ${
        expanded ? "h-[min(82vh,780px)]" : "h-[42vh] min-h-[280px] sm:h-[48vh] lg:h-[52vh]"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded((v) => !v)}
    >
      <svg
        viewBox="0 0 1920 520"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7FAFC" />
            <stop offset="55%" stopColor="#EEF3F8" />
            <stop offset="100%" stopColor="#E4ECF4" />
          </linearGradient>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>
        </defs>

        <rect width="1920" height="520" fill={`url(#${uid}-sky)`} />

        {[-8, -4, 0, 4, 8, 12, 16].map((gx) =>
          [0, 3, 6, 9].map((gy) => (
            <polygon
              key={`${gx}-${gy}`}
              points={diamond(gx, gy, 4)}
              fill="none"
              stroke="rgba(148,163,184,0.18)"
              strokeWidth="1"
            />
          ))
        )}

        {/* Long avenue — scooters ride HERE only */}
        <polygon
          points={`${iso(-7.4, 4.85).x},${iso(-7.4, 4.85).y} ${iso(20.6, 4.85).x},${iso(20.6, 4.85).y} ${iso(20.6, 5.95).x},${iso(20.6, 5.95).y} ${iso(-7.4, 5.95).x},${iso(-7.4, 5.95).y}`}
          fill="#CBD5E1"
        />
        <polygon
          points={`${iso(-7.4, 5.22).x},${iso(-7.4, 5.22).y} ${iso(20.6, 5.22).x},${iso(20.6, 5.22).y} ${iso(20.6, 5.58).x},${iso(20.6, 5.58).y} ${iso(-7.4, 5.58).x},${iso(-7.4, 5.58).y}`}
          fill="#94A3B8"
        />
        <path
          d={`M ${iso(-7.2, 5.4).x} ${iso(-7.2, 5.4).y} L ${iso(20.4, 5.4).x} ${iso(20.4, 5.4).y}`}
          stroke="#fff"
          strokeWidth="2.2"
          strokeDasharray="14 16"
          opacity="0.95"
        />
        <path id={roadId} d={`M ${a0.x} ${a0.y} L ${a1.x} ${a1.y}`} fill="none" />

        {/* NORTH of road: pickup yard + charge — never on buildings */}
        <polygon points={diamond(3.15, 2.15, 3.55)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
        <text
          x={iso(4.7, 2.2).x}
          y={iso(4.7, 2.2).y - 8}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >
          PICKUP YARD
        </text>
        {src ? (
          <>
            <RealScooter src={src} x={3.55} y={3.05} scale={0.175} />
            <RealScooter src={src} x={4.55} y={3.35} scale={0.175} />
            <RealScooter src={src} x={5.55} y={3.65} scale={0.175} />
          </>
        ) : null}

        <polygon points={diamond(11.05, 2.35, 2.7)} fill="#ECFDF5" stroke="#18B368" strokeWidth="1.4" />
        <text
          x={iso(12.3, 2.4).x}
          y={iso(12.3, 2.4).y - 10}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >
          EV CHARGE
        </text>
        <ChargePost x={11.45} y={3.15} />
        <ChargePost x={12.55} y={3.55} />
        {src ? (
          <>
            <RealScooter src={src} x={11.85} y={3.85} scale={0.16} />
            <RealScooter src={src} x={12.85} y={4.15} scale={0.16} />
          </>
        ) : null}

        {/* Buildings with rooftop solar — north and south of the road, not on it */}
        <g filter={`url(#${uid}-soft)`}>
          <Box x={-5.4} y={0.35} w={2.15} d={1.55} h={86} top="#F8FAFC" left="#E2E8F0" right="#CBD5E1" />
          <Windows x={-5.4} y={0.35} cols={4} rows={4} h={86} />
          <RoofSolar x={-4.35} y={1.05} elev={86} />

          <Box x={-2.35} y={0.55} w={2.35} d={1.7} h={118} top="#F1F5F9" left="#E2E8F0" right="#94A3B8" />
          <Windows x={-2.35} y={0.55} cols={5} rows={5} h={118} />
          <RoofSolar x={-1.2} y={1.25} elev={118} />

          <Box x={7.15} y={0.25} w={2.5} d={1.65} h={102} top="#F8FAFC" left="#E2E8F0" right="#CBD5E1" />
          <Windows x={7.15} y={0.25} cols={5} rows={5} h={102} />
          <RoofSolar x={8.35} y={1.0} elev={102} />

          <Box x={14.55} y={0.45} w={2.2} d={1.5} h={92} top="#F1F5F9" left="#E2E8F0" right="#94A3B8" />
          <Windows x={14.55} y={0.45} cols={4} rows={4} h={92} />
          <RoofSolar x={15.6} y={1.1} elev={92} />

          {/* SOUTH of road: neighbourhood + HUB (hub is NOT on the avenue) */}
          <Box x={-4.8} y={7.15} w={2.05} d={1.45} h={78} top="#F8FAFC" left="#E2E8F0" right="#CBD5E1" />
          <Windows x={-4.8} y={7.15} cols={4} rows={3} h={78} />
          <RoofSolar x={-3.8} y={7.8} elev={78} />

          <Box x={7.35} y={7.25} w={2.15} d={1.5} h={88} top="#F1F5F9" left="#E2E8F0" right="#94A3B8" />
          <Windows x={7.35} y={7.25} cols={4} rows={4} h={88} />
          <RoofSolar x={8.4} y={7.9} elev={88} />

          <Box x={14.2} y={7.05} w={2.4} d={1.55} h={96} top="#F8FAFC" left="#E2E8F0" right="#CBD5E1" />
          <Windows x={14.2} y={7.05} cols={5} rows={4} h={96} />
          <RoofSolar x={15.35} y={7.75} elev={96} />
        </g>

        {/* EVUDDY hub campus — south of the avenue */}
        <polygon
          points={`${iso(0.85, 6.95).x},${iso(0.85, 6.95).y} ${iso(5.55, 6.95).x},${iso(5.55, 6.95).y} ${iso(5.55, 9.05).x},${iso(5.55, 9.05).y} ${iso(0.85, 9.05).x},${iso(0.85, 9.05).y}`}
          fill="#D1FAE5"
          stroke="#18B368"
          strokeWidth="1.6"
        />
        <Box x={1.35} y={7.2} w={3.55} d={1.55} h={70} top="#ECFDF5" left="#6EE7B7" right="#18B368" />
        <Windows x={1.35} y={7.2} cols={6} rows={3} h={70} tone="#BBF7D0" />
        <RoofSolar x={3.05} y={7.85} elev={70} />
        <g>
          {(() => {
            const t = iso(3.1, 7.15);
            return (
              <>
                <rect x={t.x - 38} y={t.y - 96} width="76" height="22" rx="11" fill="#0F172A" />
                <text
                  x={t.x}
                  y={t.y - 81}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="system-ui,sans-serif"
                >
                  EVUDDY HUB
                </text>
              </>
            );
          })()}
        </g>

        <Tree x={-6.2} y={2.4} />
        <Tree x={0.15} y={1.85} />
        <Tree x={6.35} y={2.05} />
        <Tree x={10.15} y={1.55} />
        <Tree x={16.95} y={2.15} />
        <Tree x={-6.05} y={6.55} />
        <Tree x={6.25} y={6.75} />
        <Tree x={13.15} y={6.55} />
        <Tree x={17.35} y={6.85} />

        <Person x={-5.55} y={4.35} shirt="#18B368" />
        <Person x={-3.85} y={4.55} shirt="#EC2A8C" flip />
        <Person x={2.15} y={4.25} shirt="#0F172A" />
        <Person x={4.85} y={1.85} shirt="#18B368" />
        <Person x={8.15} y={4.45} shirt="#2563EB" flip />
        <Person x={10.55} y={4.25} shirt="#EC2A8C" />
        <Person x={13.35} y={2.05} shirt="#0F172A" />
        <Person x={16.25} y={4.55} shirt="#18B368" flip />
        <Person x={1.55} y={6.55} shirt="#EC2A8C" />
        <Person x={4.25} y={6.65} shirt="#18B368" flip />
        <Person x={9.15} y={6.55} shirt="#0F172A" />

        {src ? (
          <>
            <MovingScooter src={src} pathId={roadId} dur="11s" delay="0s" scale={0.165} />
            <MovingScooter src={src} pathId={roadId} dur="13.5s" delay="3.6s" scale={0.155} />
            <MovingScooter src={src} pathId={roadId} dur="16s" delay="7.2s" scale={0.15} />
          </>
        ) : null}

        {expanded ? (
          <>
            <g transform={`translate(${iso(4.7, 2.05).x} ${iso(4.7, 2.05).y - 118})`}>
              <rect x="-92" y="-28" width="184" height="52" rx="18" fill="#fff" stroke="#E2E8F0" />
              <text x="0" y="-6" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
                Pickup yard
              </text>
              <text x="0" y="14" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui,sans-serif">
                Booked EVUDDY scooters ready to go
              </text>
            </g>
            <g transform={`translate(${iso(3.1, 7.15).x} ${iso(3.1, 7.15).y + 58})`}>
              <rect x="-100" y="-28" width="200" height="52" rx="18" fill="#fff" stroke="#E2E8F0" />
              <text x="0" y="-6" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
                Neighbourhood hub
              </text>
              <text x="0" y="14" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui,sans-serif">
                Ops, solar roof, charging — off the road
              </text>
            </g>
          </>
        ) : null}
      </svg>

      {!expanded ? (
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-slate-600 shadow-sm">
          Hover or click to expand
        </p>
      ) : null}
    </div>
  );
}
