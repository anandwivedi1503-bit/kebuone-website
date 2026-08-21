"use client";

import { useId, useState } from "react";
import { useEvuddySideSrc } from "../Hero/useEvuddySideSrc";

/**
 * Full-width EVUDDY city strip.
 * Scooter photo faces left — moving assets are mirrored so the nose follows the path.
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
  const p = [iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)];
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
        </g>
      ))}
    </g>
  );
}

function Sign({
  x,
  y,
  elev,
  label,
  bg = "#0F172A",
  color = "#fff",
  width = 86,
}: {
  x: number;
  y: number;
  elev: number;
  label: string;
  bg?: string;
  color?: string;
  width?: number;
}) {
  const t = iso(x, y);
  return (
    <g>
      <rect x={t.x - width / 2} y={t.y - elev - 8} width={width} height={20} rx="10" fill={bg} />
      <text
        x={t.x}
        y={t.y - elev + 6}
        textAnchor="middle"
        fill={color}
        fontSize="10"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

function Awning({ x, y, w, d, c1, c2 }: { x: number; y: number; w: number; d: number; c1: string; c2: string }) {
  const strips = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = iso(x + (w * i) / n, y);
    const b = iso(x + (w * (i + 1)) / n, y);
    const c = iso(x + (w * (i + 1)) / n, y + d);
    const e = iso(x + (w * i) / n, y + d);
    strips.push(
      <polygon
        key={i}
        points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${e.x},${e.y}`}
        fill={i % 2 === 0 ? c1 : c2}
      />
    );
  }
  return <g>{strips}</g>;
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

function Lamp({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <rect x={p.x - 1.4} y={p.y - 38} width="2.8" height="38" rx="1" fill="#334155" />
      <circle cx={p.x} cy={p.y - 42} r="5" fill="#FDE68A" opacity="0.95" />
      <circle cx={p.x} cy={p.y - 42} r="8" fill="#FDE68A" opacity="0.18" />
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

function CarBody({ body, glass }: { body: string; glass: string }) {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="20" ry="5" fill="rgba(15,23,42,0.16)" />
      <path d="M-22 2 L-18 -2 L-8 -6 L8 -6 L20 -1 L24 4 L18 8 L-18 8 Z" fill={body} />
      <path d="M-8 -6 L-4 -14 L10 -14 L16 -6 Z" fill={glass} />
      <rect x="-6" y="-12" width="3" height="5" rx="0.6" fill="#93C5FD" opacity="0.9" />
      <rect x="2" y="-12" width="6" height="5" rx="0.6" fill="#93C5FD" opacity="0.75" />
      <circle cx="-12" cy="7" r="3.4" fill="#0F172A" />
      <circle cx="12" cy="7" r="3.4" fill="#0F172A" />
      <circle cx="-12" cy="7" r="1.3" fill="#94A3B8" />
      <circle cx="12" cy="7" r="1.3" fill="#94A3B8" />
      <rect x="20" y="1" width="3" height="2" rx="0.4" fill="#FDE68A" />
    </g>
  );
}

function ParkedCar({
  x,
  y,
  body,
  glass = "#1E3A5F",
}: {
  x: number;
  y: number;
  body: string;
  glass?: string;
}) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <CarBody body={body} glass={glass} />
    </g>
  );
}

function MovingCar({
  pathId,
  dur,
  delay,
  body,
}: {
  pathId: string;
  dur: string;
  delay: string;
  body: string;
}) {
  return (
    <g>
      <animateMotion dur={dur} begin={delay} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <CarBody body={body} glass="#1E3A5F" />
    </g>
  );
}

function RealScooter({
  src,
  x,
  y,
  scale = 0.2,
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
      x={p.x - w * 0.52}
      y={p.y - h * 0.88}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      transform={`translate(${p.x} ${p.y}) scale(-1 1) translate(${-p.x} ${-p.y})`}
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
      <animateMotion dur={dur} begin={delay} repeatCount="indefinite" rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <g transform="scale(-1 1)">
        <image
          href={src}
          x={-w * 0.5}
          y={-h * 0.86}
          width={w}
          height={h}
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: "drop-shadow(6px 8px 7px rgba(15,23,42,0.2))" }}
        />
      </g>
    </g>
  );
}

export default function EvuddyEcosystem() {
  const src = useEvuddySideSrc();
  const uid = useId().replace(/:/g, "");
  const roadId = `${uid}-road`;
  const carId = `${uid}-cars`;
  const backId = `${uid}-back`;
  const [expanded, setExpanded] = useState(false);

  const scootA = iso(-7.2, 5.22);
  const scootB = iso(20.4, 5.22);
  const carA = iso(-7.2, 5.58);
  const carB = iso(20.4, 5.58);
  const backA = iso(20.4, 5.4);
  const backB = iso(-7.2, 5.4);

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

        <polygon
          points={`${iso(-7.4, 4.85).x},${iso(-7.4, 4.85).y} ${iso(20.6, 4.85).x},${iso(20.6, 4.85).y} ${iso(20.6, 5.95).x},${iso(20.6, 5.95).y} ${iso(-7.4, 5.95).x},${iso(-7.4, 5.95).y}`}
          fill="#CBD5E1"
        />
        <polygon
          points={`${iso(-7.4, 5.18).x},${iso(-7.4, 5.18).y} ${iso(20.6, 5.18).x},${iso(20.6, 5.18).y} ${iso(20.6, 5.62).x},${iso(20.6, 5.62).y} ${iso(-7.4, 5.62).x},${iso(-7.4, 5.62).y}`}
          fill="#94A3B8"
        />
        <path
          d={`M ${iso(-7.2, 5.4).x} ${iso(-7.2, 5.4).y} L ${iso(20.4, 5.4).x} ${iso(20.4, 5.4).y}`}
          stroke="#fff"
          strokeWidth="2.2"
          strokeDasharray="14 16"
          opacity="0.95"
        />
        <path id={roadId} d={`M ${scootA.x} ${scootA.y} L ${scootB.x} ${scootB.y}`} fill="none" />
        <path id={carId} d={`M ${carA.x} ${carA.y} L ${carB.x} ${carB.y}`} fill="none" />
        <path id={backId} d={`M ${backA.x} ${backA.y} L ${backB.x} ${backB.y}`} fill="none" />

        <g filter={`url(#${uid}-soft)`}>
          {/* Hotel */}
          <Box x={-6.15} y={0.2} w={2.45} d={1.7} h={132} top="#FFF1F2" left="#FECDD3" right="#F43F5E" />
          <Windows x={-6.15} y={0.2} cols={5} rows={6} h={132} tone="#FECACA" />
          <Sign x={-4.95} y={0.25} elev={132} label="HOTEL" bg="#9F1239" width={78} />

          {/* Offices */}
          <Box x={-3.35} y={0.35} w={2.55} d={1.75} h={148} top="#EFF6FF" left="#BFDBFE" right="#3B82F6" />
          <Windows x={-3.35} y={0.35} cols={5} rows={7} h={148} />
          <RoofSolar x={-2.1} y={1.15} elev={148} />
          <Sign x={-2.1} y={0.4} elev={148} label="OFFICES" bg="#1D4ED8" width={92} />

          {/* Cafe + mart */}
          <Box x={-0.45} y={1.05} w={2.2} d={1.35} h={52} top="#FFF7ED" left="#FED7AA" right="#F97316" />
          <Windows x={-0.45} y={1.05} cols={4} rows={2} h={52} tone="#FFEDD5" />
          <Awning x={-0.45} y={2.28} w={2.2} d={0.28} c1="#EC2A8C" c2="#fff" />
          <Sign x={0.65} y={1.15} elev={52} label="CAFE" bg="#C2410C" width={64} />

          <Box x={7.05} y={0.15} w={3.35} d={1.85} h={108} top="#EEF2FF" left="#C7D2FE" right="#6366F1" />
          <Windows x={7.05} y={0.15} cols={7} rows={5} h={108} tone="#A5B4FC" />
          <Sign x={8.7} y={0.2} elev={108} label="MALL" bg="#3730A3" width={78} />

          <Box x={14.35} y={0.3} w={2.35} d={1.55} h={96} top="#F8FAFC" left="#E2E8F0" right="#64748B" />
          <Windows x={14.35} y={0.3} cols={5} rows={4} h={96} />
          <RoofSolar x={15.5} y={1.0} elev={96} />
          <Sign x={15.5} y={0.35} elev={96} label="TOWER" bg="#334155" width={74} />

          {/* South: shops, station, more offices */}
          <Box x={-6.2} y={7.05} w={2.15} d={1.4} h={58} top="#ECFDF5" left="#BBF7D0" right="#18B368" />
          <Windows x={-6.2} y={7.05} cols={4} rows={2} h={58} tone="#BBF7D0" />
          <Awning x={-6.2} y={8.3} w={2.15} d={0.26} c1="#18B368" c2="#fff" />
          <Sign x={-5.15} y={7.1} elev={58} label="MART" bg="#15803D" width={70} />

          <Box x={7.15} y={7.15} w={2.55} d={1.55} h={118} top="#F1F5F9" left="#CBD5E1" right="#475569" />
          <Windows x={7.15} y={7.15} cols={5} rows={5} h={118} />
          <RoofSolar x={8.4} y={7.85} elev={118} />
          <Sign x={8.4} y={7.2} elev={118} label="OFFICE" bg="#0F172A" width={84} />

          <Box x={13.85} y={6.95} w={3.15} d={1.7} h={64} top="#FEF3C7" left="#FDE68A" right="#D97706" />
          <Windows x={13.85} y={6.95} cols={6} rows={2} h={64} tone="#FDE68A" />
          <Sign x={15.4} y={7.0} elev={64} label="STATION" bg="#92400E" width={96} />
        </g>

        {/* Station canopy + platform */}
        <polygon
          points={`${iso(13.7, 8.5).x},${iso(13.7, 8.5).y} ${iso(17.15, 8.5).x},${iso(17.15, 8.5).y} ${iso(17.15, 9.15).x},${iso(17.15, 9.15).y} ${iso(13.7, 9.15).x},${iso(13.7, 9.15).y}`}
          fill="#E2E8F0"
        />
        <polygon
          points={`${iso(13.55, 8.35).x},${iso(13.55, 8.35).y - 28} ${iso(17.3, 8.35).x},${iso(17.3, 8.35).y - 28} ${iso(17.3, 9.2).x},${iso(17.3, 9.2).y - 18} ${iso(13.55, 9.2).x},${iso(13.55, 9.2).y - 18}`}
          fill="#0F172A"
          opacity="0.88"
        />

        <polygon points={diamond(3.2, 2.05, 3.4)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
        <text
          x={iso(4.8, 2.1).x}
          y={iso(4.8, 2.1).y - 8}
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
            <RealScooter src={src} x={3.6} y={2.95} scale={0.17} />
            <RealScooter src={src} x={4.55} y={3.25} scale={0.17} />
            <RealScooter src={src} x={5.5} y={3.55} scale={0.17} />
          </>
        ) : null}

        <polygon points={diamond(10.85, 2.25, 2.65)} fill="#ECFDF5" stroke="#18B368" strokeWidth="1.4" />
        <text
          x={iso(12.1, 2.3).x}
          y={iso(12.1, 2.3).y - 10}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >
          EV CHARGE
        </text>
        <ChargePost x={11.25} y={3.05} />
        <ChargePost x={12.35} y={3.45} />
        {src ? (
          <>
            <RealScooter src={src} x={11.65} y={3.75} scale={0.155} />
            <RealScooter src={src} x={12.65} y={4.05} scale={0.155} />
          </>
        ) : null}

        <polygon
          points={`${iso(0.75, 6.9).x},${iso(0.75, 6.9).y} ${iso(5.65, 6.9).x},${iso(5.65, 6.9).y} ${iso(5.65, 9.1).x},${iso(5.65, 9.1).y} ${iso(0.75, 9.1).x},${iso(0.75, 9.1).y}`}
          fill="#D1FAE5"
          stroke="#18B368"
          strokeWidth="1.6"
        />
        <Box x={1.25} y={7.15} w={3.55} d={1.55} h={70} top="#ECFDF5" left="#6EE7B7" right="#18B368" />
        <Windows x={1.25} y={7.15} cols={6} rows={3} h={70} tone="#BBF7D0" />
        <RoofSolar x={2.95} y={7.8} elev={70} />
        <Sign x={3.0} y={7.15} elev={86} label="EVUDDY HUB" bg="#0F172A" width={108} />

        <ParkedCar x={-4.55} y={4.55} body="#0F172A" />
        <ParkedCar x={0.85} y={4.45} body="#2563EB" />
        <ParkedCar x={8.55} y={4.5} body="#F8FAFC" glass="#334155" />
        <ParkedCar x={16.15} y={4.55} body="#EC2A8C" />
        <ParkedCar x={-3.15} y={6.55} body="#F59E0B" />
        <ParkedCar x={9.85} y={6.6} body="#18B368" />

        <Lamp x={-5.4} y={4.7} />
        <Lamp x={1.1} y={4.7} />
        <Lamp x={6.4} y={4.7} />
        <Lamp x={12.9} y={4.7} />
        <Lamp x={18.2} y={4.7} />
        <Lamp x={-4.9} y={6.15} />
        <Lamp x={6.1} y={6.15} />
        <Lamp x={15.4} y={6.15} />

        <Tree x={-6.55} y={2.55} />
        <Tree x={-0.85} y={0.55} />
        <Tree x={6.35} y={2.05} />
        <Tree x={10.05} y={1.45} />
        <Tree x={17.05} y={2.2} />
        <Tree x={-6.85} y={6.45} />
        <Tree x={6.15} y={6.7} />
        <Tree x={12.55} y={6.5} />
        <Tree x={17.55} y={6.75} />

        <Person x={-5.35} y={4.3} shirt="#18B368" />
        <Person x={-4.15} y={4.45} shirt="#EC2A8C" flip />
        <Person x={-0.15} y={2.55} shirt="#F97316" />
        <Person x={0.85} y={2.65} shirt="#0F172A" flip />
        <Person x={2.25} y={4.25} shirt="#2563EB" />
        <Person x={4.75} y={1.75} shirt="#18B368" />
        <Person x={8.05} y={4.35} shirt="#EC2A8C" flip />
        <Person x={8.95} y={2.15} shirt="#6366F1" />
        <Person x={10.45} y={4.2} shirt="#0F172A" />
        <Person x={12.55} y={2.0} shirt="#18B368" flip />
        <Person x={15.85} y={4.45} shirt="#F59E0B" />
        <Person x={-5.05} y={8.55} shirt="#0F172A" />
        <Person x={-4.15} y={8.7} shirt="#EC2A8C" flip />
        <Person x={1.45} y={6.5} shirt="#18B368" />
        <Person x={4.15} y={6.6} shirt="#EC2A8C" flip />
        <Person x={9.05} y={6.5} shirt="#2563EB" />
        <Person x={14.55} y={8.85} shirt="#92400E" />
        <Person x={15.55} y={8.95} shirt="#0F172A" flip />
        <Person x={16.45} y={8.75} shirt="#18B368" />

        <MovingCar pathId={carId} dur="14s" delay="0s" body="#0F172A" />
        <MovingCar pathId={carId} dur="18s" delay="6s" body="#2563EB" />
        <MovingCar pathId={backId} dur="16s" delay="2.5s" body="#F8FAFC" />
        <MovingCar pathId={backId} dur="20s" delay="11s" body="#F59E0B" />

        {src ? (
          <>
            <MovingScooter src={src} pathId={roadId} dur="11s" delay="0s" scale={0.16} />
            <MovingScooter src={src} pathId={roadId} dur="13.5s" delay="3.8s" scale={0.15} />
            <MovingScooter src={src} pathId={backId} dur="12.5s" delay="1.6s" scale={0.15} />
            <MovingScooter src={src} pathId={backId} dur="15s" delay="7s" scale={0.145} />
          </>
        ) : null}

        {expanded ? (
          <>
            <g transform={`translate(${iso(4.8, 2.0).x} ${iso(4.8, 2.0).y - 118})`}>
              <rect x="-92" y="-28" width="184" height="52" rx="18" fill="#fff" stroke="#E2E8F0" />
              <text x="0" y="-6" textAnchor="middle" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
                Pickup yard
              </text>
              <text x="0" y="14" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="system-ui,sans-serif">
                Booked EVUDDY scooters ready to go
              </text>
            </g>
            <g transform={`translate(${iso(3.0, 7.15).x} ${iso(3.0, 7.15).y + 58})`}>
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
