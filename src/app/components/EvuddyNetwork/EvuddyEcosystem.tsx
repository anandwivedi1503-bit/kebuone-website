"use client";

import { useId } from "react";
import { useEvuddySideSrc } from "../Hero/useEvuddySideSrc";

/**
 * Panoramic EVUDDY city.
 * Flattened isometric (small UY) so the avenue actually runs left–right
 * across the full viewport instead of a steep diagonal sitting in the middle.
 * Scooters and cars use separate lanes so sprites do not stack.
 */

const OX = 1200;
const OY = 210;
const UX = 42;
const UY = 7.5;
const VB_W = 2400;
const VB_H = 640;

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
      <polygon points="-22,-5 8,-18 38,-5 8,8" fill="#0B3B22" />
      {[-14, -2, 10].map((dx) => (
        <polygon
          key={dx}
          points={`${dx},-1 ${dx + 10},-6 ${dx + 18},-1 ${dx + 8},4`}
          fill="#14532D"
          stroke="#86EFAC"
          strokeWidth="0.6"
        />
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
  width = 78,
}: {
  x: number;
  y: number;
  elev: number;
  label: string;
  bg?: string;
  width?: number;
}) {
  const t = iso(x, y);
  return (
    <g>
      <rect x={t.x - width / 2} y={t.y - elev - 6} width={width} height={18} rx="9" fill={bg} />
      <text
        x={t.x}
        y={t.y - elev + 7}
        textAnchor="middle"
        fill="#fff"
        fontSize="9"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

function Awning({ x, y, w, d, c1, c2 }: { x: number; y: number; w: number; d: number; c1: string; c2: string }) {
  const n = 6;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = iso(x + (w * i) / n, y);
        const b = iso(x + (w * (i + 1)) / n, y);
        const c = iso(x + (w * (i + 1)) / n, y + d);
        const e = iso(x + (w * i) / n, y + d);
        return (
          <polygon
            key={i}
            points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y} ${e.x},${e.y}`}
            fill={i % 2 === 0 ? c1 : c2}
          />
        );
      })}
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <ellipse cx={p.x} cy={p.y + 5} rx="9" ry="3.2" fill="rgba(15,23,42,0.1)" />
      <rect x={p.x - 2} y={p.y - 12} width="4" height="15" rx="1.2" fill="#7C4A2A" />
      <ellipse cx={p.x} cy={p.y - 18} rx="13" ry="11" fill="#166534" />
      <ellipse cx={p.x + 4} cy={p.y - 24} rx="9" ry="7" fill="#22C55E" />
    </g>
  );
}

function Lamp({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <rect x={p.x - 1.2} y={p.y - 34} width="2.4" height="34" rx="1" fill="#334155" />
      <circle cx={p.x} cy={p.y - 38} r="4.2" fill="#FDE68A" />
    </g>
  );
}

function Person({ x, y, shirt, flip }: { x: number; y: number; shirt: string; flip?: boolean }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="0" cy="3" rx="5.5" ry="2" fill="rgba(15,23,42,0.14)" />
      <rect x="-2.6" y="-15" width="5.2" height="12" rx="2" fill={shirt} />
      <circle cx="0" cy="-19" r="3.6" fill="#F4C7A5" />
      <rect x="-2.4" y="-4" width="2.1" height="8" rx="1" fill="#1E3A5F" />
      <rect x="0.4" y="-4" width="2.1" height="8" rx="1" fill="#1E3A5F" />
    </g>
  );
}

function ChargePost({ x, y }: { x: number; y: number }) {
  const p = iso(x, y);
  return (
    <g>
      <rect x={p.x - 6} y={p.y - 24} width="12" height="26" rx="2.5" fill="#0F172A" />
      <rect x={p.x - 4} y={p.y - 20} width="8" height="7" rx="1.2" fill="#18B368" />
      <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#fff" fontSize="5" fontWeight="800" fontFamily="system-ui,sans-serif">
        EV
      </text>
      <circle cx={p.x} cy={p.y - 28} r="2.6" fill="#EC2A8C" />
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
          x={origin.x + 6 + c * 9 - r}
          y={origin.y - h + 8 + r * 12}
          width="6"
          height="8"
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
    <g transform="scale(0.72)">
      <ellipse cx="0" cy="6" rx="18" ry="4" fill="rgba(15,23,42,0.14)" />
      <path d="M-20 2 L-16 -2 L-7 -5 L8 -5 L18 -1 L22 4 L16 7 L-16 7 Z" fill={body} />
      <path d="M-7 -5 L-3 -12 L9 -12 L14 -5 Z" fill={glass} />
      <circle cx="-10" cy="7" r="3" fill="#0F172A" />
      <circle cx="10" cy="7" r="3" fill="#0F172A" />
      <rect x="18" y="1" width="2.5" height="1.8" rx="0.3" fill="#FDE68A" />
    </g>
  );
}

function ParkedCar({ x, y, body }: { x: number; y: number; body: string }) {
  const p = iso(x, y);
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <CarBody body={body} glass="#1E3A5F" />
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

function RealScooter({ src, x, y, scale = 0.11 }: { src: string; x: number; y: number; scale?: number }) {
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
      style={{ filter: "drop-shadow(5px 6px 5px rgba(15,23,42,0.2))" }}
    />
  );
}

function MovingScooter({
  src,
  pathId,
  dur,
  delay,
  scale = 0.11,
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
          style={{ filter: "drop-shadow(5px 6px 5px rgba(15,23,42,0.18))" }}
        />
      </g>
    </g>
  );
}

export default function EvuddyEcosystem() {
  const src = useEvuddySideSrc();
  const uid = useId().replace(/:/g, "");
  const scootPath = `${uid}-scoot`;
  const carPath = `${uid}-car`;

  const s0 = iso(-21, 5.8);
  const s1 = iso(41, 5.8);
  const c0 = iso(41, 7.55);
  const c1 = iso(-21, 7.55);

  return (
    <div className="relative h-[280px] w-full max-w-full overflow-hidden bg-[#F4F7F8] sm:h-[420px] lg:h-[520px]">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FBFD" />
            <stop offset="55%" stopColor="#EEF4F8" />
            <stop offset="100%" stopColor="#E4ECE8" />
          </linearGradient>
          <filter id={`${uid}-soft`} x="-12%" y="-12%" width="124%" height="124%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0F172A" floodOpacity="0.07" />
          </filter>
        </defs>

        <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sky)`} />

        {[-24, -16, -8, 0, 8, 16, 24, 32, 40].map((gx) =>
          [0, 5, 10].map((gy) => (
            <polygon
              key={`${gx}-${gy}`}
              points={diamond(gx, gy, 8)}
              fill="none"
              stroke="rgba(148,163,184,0.14)"
              strokeWidth="1"
            />
          ))
        )}

        {/* Wide boulevard — scooters north lane, cars south lane */}
        <polygon
          points={`${iso(-22, 5.15).x},${iso(-22, 5.15).y} ${iso(42, 5.15).x},${iso(42, 5.15).y} ${iso(42, 8.15).x},${iso(42, 8.15).y} ${iso(-22, 8.15).x},${iso(-22, 8.15).y}`}
          fill="#D6DEE8"
        />
        <polygon
          points={`${iso(-22, 5.55).x},${iso(-22, 5.55).y} ${iso(42, 5.55).x},${iso(42, 5.55).y} ${iso(42, 6.15).x},${iso(42, 6.15).y} ${iso(-22, 6.15).x},${iso(-22, 6.15).y}`}
          fill="#94A3B8"
        />
        <polygon
          points={`${iso(-22, 7.2).x},${iso(-22, 7.2).y} ${iso(42, 7.2).x},${iso(42, 7.2).y} ${iso(42, 7.85).x},${iso(42, 7.85).y} ${iso(-22, 7.85).x},${iso(-22, 7.85).y}`}
          fill="#94A3B8"
        />
        <path
          d={`M ${iso(-21, 6.65).x} ${iso(-21, 6.65).y} L ${iso(41, 6.65).x} ${iso(41, 6.65).y}`}
          stroke="#fff"
          strokeWidth="2.4"
          strokeDasharray="18 20"
        />
        <path id={scootPath} d={`M ${s0.x} ${s0.y} L ${s1.x} ${s1.y}`} fill="none" />
        <path id={carPath} d={`M ${c0.x} ${c0.y} L ${c1.x} ${c1.y}`} fill="none" />

        <g filter={`url(#${uid}-soft)`}>
          <Box x={-20.5} y={0.35} w={2.6} d={1.55} h={118} top="#FFF1F2" left="#E2E8F0" right="#64748B" />
          <Windows x={-20.5} y={0.35} cols={5} rows={5} h={118} tone="#FECACA" />
          <Sign x={-19.2} y={0.4} elev={118} label="HOTEL" bg="#9F1239" />

          <Box x={-16.6} y={0.45} w={2.7} d={1.6} h={132} top="#EFF6FF" left="#BFDBFE" right="#3B82F6" />
          <Windows x={-16.6} y={0.45} cols={5} rows={6} h={132} />
          <RoofSolar x={-15.3} y={1.15} elev={132} />
          <Sign x={-15.3} y={0.5} elev={132} label="OFFICES" bg="#1D4ED8" width={88} />

          <Box x={-12.6} y={1.05} w={2.3} d={1.2} h={48} top="#FFF7ED" left="#FED7AA" right="#F97316" />
          <Windows x={-12.6} y={1.05} cols={4} rows={2} h={48} tone="#FFEDD5" />
          <Awning x={-12.6} y={2.12} w={2.3} d={0.28} c1="#EC2A8C" c2="#fff" />
          <Sign x={-11.45} y={1.1} elev={48} label="CAFE" bg="#C2410C" width={60} />

          <Box x={3.4} y={0.25} w={3.4} d={1.7} h={96} top="#EEF2FF" left="#C7D2FE" right="#6366F1" />
          <Windows x={3.4} y={0.25} cols={7} rows={4} h={96} tone="#A5B4FC" />
          <Sign x={5.1} y={0.3} elev={96} label="MALL" bg="#3730A3" />

          <Box x={14.6} y={0.4} w={2.5} d={1.5} h={88} top="#F8FAFC" left="#E2E8F0" right="#64748B" />
          <Windows x={14.6} y={0.4} cols={5} rows={4} h={88} />
          <RoofSolar x={15.85} y={1.05} elev={88} />
          <Sign x={15.85} y={0.45} elev={88} label="TOWER" bg="#334155" />

          <Box x={18.4} y={1.0} w={2.2} d={1.15} h={46} top="#ECFDF5" left="#BBF7D0" right="#18B368" />
          <Windows x={18.4} y={1.0} cols={4} rows={2} h={46} tone="#BBF7D0" />
          <Awning x={18.4} y={2.02} w={2.2} d={0.26} c1="#18B368" c2="#fff" />
          <Sign x={19.5} y={1.05} elev={46} label="MART" bg="#15803D" width={64} />

          <Box x={22.2} y={0.35} w={2.6} d={1.55} h={110} top="#F1F5F9" left="#CBD5E1" right="#475569" />
          <Windows x={22.2} y={0.35} cols={5} rows={5} h={110} />
          <RoofSolar x={23.5} y={1.05} elev={110} />
          <Sign x={23.5} y={0.4} elev={110} label="OFFICE" bg="#0F172A" width={84} />

          <Box x={26.4} y={0.5} w={2.5} d={1.45} h={102} top="#FFF1F2" left="#E2E8F0" right="#FB7185" />
          <Windows x={26.4} y={0.5} cols={5} rows={4} h={102} tone="#FECACA" />
          <Sign x={27.65} y={0.55} elev={102} label="HOTEL" bg="#9F1239" />

          <Box x={30.6} y={0.3} w={2.7} d={1.5} h={92} top="#EEF2FF" left="#C7D2FE" right="#4F46E5" />
          <Windows x={30.6} y={0.3} cols={5} rows={4} h={92} />
          <Sign x={31.95} y={0.35} elev={92} label="PLAZA" bg="#312E81" />

          {/* South of the boulevard */}
          <Box x={-19.8} y={9.05} w={2.3} d={1.25} h={52} top="#ECFDF5" left="#BBF7D0" right="#18B368" />
          <Windows x={-19.8} y={9.05} cols={4} rows={2} h={52} tone="#BBF7D0" />
          <Awning x={-19.8} y={10.15} w={2.3} d={0.26} c1="#18B368" c2="#fff" />
          <Sign x={-18.65} y={9.1} elev={52} label="SHOP" bg="#15803D" width={64} />

          <Box x={2.6} y={9.15} w={2.6} d={1.5} h={108} top="#F1F5F9" left="#CBD5E1" right="#475569" />
          <Windows x={2.6} y={9.15} cols={5} rows={5} h={108} />
          <RoofSolar x={3.9} y={9.85} elev={108} />
          <Sign x={3.9} y={9.2} elev={108} label="OFFICE" bg="#0F172A" width={84} />

          <Box x={7.6} y={9.0} w={3.2} d={1.55} h={58} top="#FEF3C7" left="#FDE68A" right="#D97706" />
          <Windows x={7.6} y={9.0} cols={6} rows={2} h={58} tone="#FDE68A" />
          <Sign x={9.2} y={9.05} elev={58} label="STATION" bg="#92400E" width={92} />

          <Box x={16.4} y={9.1} w={2.2} d={1.2} h={48} top="#FFF7ED" left="#FED7AA" right="#F97316" />
          <Windows x={16.4} y={9.1} cols={4} rows={2} h={48} tone="#FFEDD5" />
          <Awning x={16.4} y={10.15} w={2.2} d={0.26} c1="#EC2A8C" c2="#fff" />
          <Sign x={17.5} y={9.15} elev={48} label="CAFE" bg="#C2410C" width={60} />

          <Box x={20.8} y={9.05} w={2.7} d={1.5} h={96} top="#EEF2FF" left="#C7D2FE" right="#6366F1" />
          <Windows x={20.8} y={9.05} cols={5} rows={4} h={96} />
          <Sign x={22.15} y={9.1} elev={96} label="MALL" bg="#3730A3" />

          <Box x={25.8} y={9.2} w={2.5} d={1.4} h={88} top="#F8FAFC" left="#E2E8F0" right="#64748B" />
          <Windows x={25.8} y={9.2} cols={5} rows={4} h={88} />
          <RoofSolar x={27.05} y={9.85} elev={88} />
          <Sign x={27.05} y={9.25} elev={88} label="TOWER" bg="#334155" />

          <Box x={30.4} y={9.05} w={2.4} d={1.3} h={72} top="#FFF1F2" left="#E2E8F0" right="#64748B" />
          <Windows x={30.4} y={9.05} cols={4} rows={3} h={72} tone="#FECACA" />
          <Sign x={31.6} y={9.1} elev={72} label="INN" bg="#9F1239" width={56} />
        </g>

        <polygon
          points={`${iso(7.4, 10.4).x},${iso(7.4, 10.4).y} ${iso(10.9, 10.4).x},${iso(10.9, 10.4).y} ${iso(10.9, 10.95).x},${iso(10.9, 10.95).y} ${iso(7.4, 10.95).x},${iso(7.4, 10.95).y}`}
          fill="#E2E8F0"
        />

        <polygon points={diamond(-8.6, 1.15, 4.2)} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.1" />
        <text
          x={iso(-6.5, 1.2).x}
          y={iso(-6.5, 1.2).y - 6}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="10"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >
          PICKUP YARD
        </text>
        {src ? (
          <>
            <RealScooter src={src} x={-7.8} y={2.35} />
            <RealScooter src={src} x={-6.3} y={2.7} />
            <RealScooter src={src} x={-4.8} y={3.05} />
          </>
        ) : null}

        <polygon points={diamond(8.7, 1.25, 3.3)} fill="#ECFDF5" stroke="#18B368" strokeWidth="1.3" />
        <text
          x={iso(10.3, 1.3).x}
          y={iso(10.3, 1.3).y - 8}
          textAnchor="middle"
          fill="#0F172A"
          fontSize="10"
          fontWeight="800"
          fontFamily="system-ui,sans-serif"
        >
          EV CHARGE
        </text>
        <ChargePost x={9.3} y={2.35} />
        <ChargePost x={10.7} y={2.75} />
        {src ? (
          <>
            <RealScooter src={src} x={9.5} y={3.15} />
            <RealScooter src={src} x={11.0} y={3.5} />
          </>
        ) : null}

        <polygon
          points={`${iso(-13.4, 8.95).x},${iso(-13.4, 8.95).y} ${iso(-7.2, 8.95).x},${iso(-7.2, 8.95).y} ${iso(-7.2, 11.15).x},${iso(-7.2, 11.15).y} ${iso(-13.4, 11.15).x},${iso(-13.4, 11.15).y}`}
          fill="#D1FAE5"
          stroke="#18B368"
          strokeWidth="1.5"
        />
        <Box x={-12.8} y={9.15} w={4.4} d={1.45} h={62} top="#ECFDF5" left="#6EE7B7" right="#18B368" />
        <Windows x={-12.8} y={9.15} cols={7} rows={2} h={62} tone="#BBF7D0" />
        <RoofSolar x={-10.6} y={9.8} elev={62} />
        <Sign x={-10.6} y={9.15} elev={78} label="EVUDDY HUB" bg="#0F172A" width={110} />

        {/* Parked cars on curbs only — not in moving lanes */}
        <ParkedCar x={-17.5} y={4.45} body="#0F172A" />
        <ParkedCar x={-10.2} y={4.45} body="#2563EB" />
        <ParkedCar x={1.4} y={4.45} body="#F8FAFC" />
        <ParkedCar x={13.2} y={4.45} body="#EC2A8C" />
        <ParkedCar x={21.0} y={4.45} body="#F59E0B" />
        <ParkedCar x={29.5} y={4.45} body="#18B368" />
        <ParkedCar x={-16.8} y={8.7} body="#64748B" />
        <ParkedCar x={-3.4} y={8.7} body="#2563EB" />
        <ParkedCar x={6.2} y={8.7} body="#0F172A" />
        <ParkedCar x={14.8} y={8.7} body="#F97316" />
        <ParkedCar x={24.2} y={8.7} body="#EC2A8C" />
        <ParkedCar x={32.4} y={8.7} body="#18B368" />

        {[-18, -9, 0, 9, 18, 27, 36].map((x) => (
          <Lamp key={`n-${x}`} x={x} y={4.85} />
        ))}
        {[-15, -6, 3, 12, 21, 30].map((x) => (
          <Lamp key={`s-${x}`} x={x} y={8.35} />
        ))}

        <Tree x={-18.2} y={2.55} />
        <Tree x={-13.8} y={2.7} />
        <Tree x={2.2} y={2.4} />
        <Tree x={7.4} y={2.2} />
        <Tree x={13.2} y={2.55} />
        <Tree x={21.2} y={2.45} />
        <Tree x={25.4} y={2.3} />
        <Tree x={34.2} y={2.5} />
        <Tree x={-17.2} y={8.95} />
        <Tree x={-5.4} y={8.85} />
        <Tree x={1.2} y={8.9} />
        <Tree x={12.6} y={8.8} />
        <Tree x={19.4} y={8.95} />
        <Tree x={29.2} y={8.85} />
        <Tree x={34.6} y={8.9} />

        <Person x={-18.6} y={4.25} shirt="#18B368" />
        <Person x={-15.4} y={4.25} shirt="#EC2A8C" flip />
        <Person x={-11.8} y={2.55} shirt="#F97316" />
        <Person x={-7.2} y={1.55} shirt="#18B368" />
        <Person x={-2.6} y={4.25} shirt="#0F172A" flip />
        <Person x={4.6} y={4.2} shirt="#2563EB" />
        <Person x={9.4} y={2.15} shirt="#18B368" />
        <Person x={15.2} y={4.25} shirt="#EC2A8C" flip />
        <Person x={19.2} y={2.45} shirt="#15803D" />
        <Person x={23.6} y={4.2} shirt="#0F172A" />
        <Person x={28.4} y={4.25} shirt="#6366F1" flip />
        <Person x={33.2} y={4.2} shirt="#F59E0B" />
        <Person x={-18.4} y={8.9} shirt="#0F172A" />
        <Person x={-14.6} y={10.7} shirt="#18B368" />
        <Person x={-10.2} y={10.75} shirt="#EC2A8C" flip />
        <Person x={-2.8} y={8.9} shirt="#2563EB" />
        <Person x={4.2} y={8.85} shirt="#0F172A" flip />
        <Person x={9.4} y={10.7} shirt="#92400E" />
        <Person x={17.4} y={10.55} shirt="#F97316" />
        <Person x={22.6} y={8.9} shirt="#18B368" flip />
        <Person x={31.6} y={8.9} shirt="#EC2A8C" />

        <MovingCar pathId={carPath} dur="22s" delay="0s" body="#0F172A" />
        <MovingCar pathId={carPath} dur="26s" delay="12s" body="#2563EB" />

        {src ? (
          <>
            <MovingScooter src={src} pathId={scootPath} dur="20s" delay="0s" />
            <MovingScooter src={src} pathId={scootPath} dur="24s" delay="11s" />
          </>
        ) : null}
      </svg>
    </div>
  );
}
