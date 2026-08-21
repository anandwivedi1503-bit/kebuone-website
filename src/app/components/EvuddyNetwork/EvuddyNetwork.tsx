"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type CityMark = {
  name: string;
  x: number;
  y: number;
  hubs: string;
};

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  Srinagar: { x: 248, y: 52 },
  Delhi: { x: 242, y: 148 },
  Noida: { x: 250, y: 154 },
  Gurugram: { x: 234, y: 156 },
  Mathura: { x: 236, y: 168 },
  Agra: { x: 240, y: 176 },
  Jaipur: { x: 200, y: 178 },
  Lucknow: { x: 286, y: 172 },
  Kanpur: { x: 274, y: 180 },
  Ahmedabad: { x: 168, y: 230 },
  Surat: { x: 172, y: 258 },
  Mumbai: { x: 176, y: 292 },
  Pune: { x: 196, y: 308 },
  Indore: { x: 220, y: 236 },
  Bhopal: { x: 236, y: 228 },
  Hyderabad: { x: 248, y: 332 },
  Bengaluru: { x: 236, y: 392 },
  Bangalore: { x: 236, y: 392 },
  Chennai: { x: 276, y: 408 },
  Kolkata: { x: 352, y: 236 },
  Patna: { x: 318, y: 196 },
  Chandigarh: { x: 230, y: 118 },
};

const FALLBACK_CITIES: CityMark[] = [
  { name: "Delhi", x: 242, y: 148, hubs: "Capital hub live" },
  { name: "Mathura", x: 236, y: 168, hubs: "EVUDDY pickup hub" },
  { name: "Jaipur", x: 200, y: 178, hubs: "City hub live" },
  { name: "Lucknow", x: 286, y: 172, hubs: "Ride & return yard" },
  { name: "Mumbai", x: 176, y: 292, hubs: "Coastal hub live" },
  { name: "Hyderabad", x: 248, y: 332, hubs: "South hub live" },
  { name: "Bengaluru", x: 236, y: 392, hubs: "Tech city hub" },
];

const INDIA =
  "M248 28 C262 36 274 52 282 70 C292 92 304 108 318 118 C332 128 348 142 352 162 C358 186 348 204 360 218 C372 234 384 248 378 270 C372 292 358 308 348 330 C338 354 332 378 318 402 C304 428 292 452 270 470 C248 488 226 502 204 496 C184 490 174 470 162 448 C150 424 138 400 124 378 C110 354 92 338 84 314 C76 290 80 266 74 244 C68 220 58 200 66 178 C74 156 94 144 112 128 C130 112 142 92 158 74 C176 54 198 38 222 30 C234 26 240 24 248 28 Z";

function Building({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  const dx = w * 0.55;
  const dy = w * 0.32;
  return (
    <g>
      <path d={`M${x} ${y} l${dx} ${-dy} l${w} 0 l${-dx} ${dy} z`} fill="#D7E8F4" />
      <path d={`M${x} ${y} l${w} 0 l0 ${h} l${-w} 0 z`} fill={fill} />
      <path d={`M${x + w} ${y} l${dx} ${-dy} l0 ${h} l${-dx} ${dy} z`} fill="#B9D4E6" />
    </g>
  );
}

function IsometricCity() {
  return (
    <svg viewBox="0 0 760 320" className="h-auto w-full" aria-hidden>
      <defs>
        <pattern id="evuddy-iso-grid" width="28" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8 L14 0 L28 8 L14 16 Z" fill="none" stroke="#D5DEE6" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="760" height="320" fill="url(#evuddy-iso-grid)" />
      <ellipse cx="380" cy="292" rx="300" ry="18" fill="#0F172A" opacity="0.06" />

      <path d="M40 230 L220 140 L700 210 L520 300 Z" fill="#C5D0C9" />
      <path d="M80 236 L240 154 L680 214 L520 292 Z" fill="#9AA3AC" />
      <path d="M120 238 L700 216" stroke="white" strokeDasharray="10 10" strokeWidth="2" />

      <Building x={160} y={150} w={42} h={70} fill="#EEF6FB" />
      <Building x={230} y={128} w={36} h={58} fill="#FFFFFF" />
      <Building x={430} y={118} w={48} h={82} fill="#EAF6F0" />
      <Building x={510} y={138} w={40} h={64} fill="#FFFFFF" />
      <Building x={300} y={96} w={44} h={90} fill="#F8FAFC" />

      <g>
        <path d="M340 178 l28 -16 l36 0 l-28 16 z" fill="#18B368" />
        <path d="M340 178 l36 0 l0 38 l-36 0 z" fill="#0F172A" />
        <path d="M376 178 l28 -16 l0 38 l-28 16 z" fill="#16A34A" />
        <text x="358" y="202" textAnchor="middle" fill="#6EE7A8" fontSize="7" fontWeight="800">
          HUB
        </text>
      </g>

      <ellipse cx="268" cy="214" rx="18" ry="7" fill="#EC2A8C" />
      <ellipse cx="292" cy="226" rx="16" ry="6" fill="#EC2A8C" />
      <ellipse cx="470" cy="232" rx="17" ry="7" fill="#EC2A8C" />

      <circle cx="148" cy="188" r="10" fill="#3F9A4F" />
      <circle cx="410" cy="168" r="11" fill="#3F9A4F" />
      <circle cx="580" cy="198" r="9" fill="#22C55E" />
    </svg>
  );
}

export default function EvuddyNetwork() {
  const [active, setActive] = useState<CityMark>(FALLBACK_CITIES[1]);
  const [liveCities, setLiveCities] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((json) => {
        const names = (json.data || [])
          .map((item: { cityName?: string }) => String(item.cityName || "").trim())
          .filter(Boolean);
        setLiveCities(names);
      })
      .catch(() => setLiveCities([]));
  }, []);

  const marks = useMemo(() => {
    const fromApi = liveCities
      .map((name) => {
        const hit = Object.keys(CITY_COORDS).find(
          (key) => key.toLowerCase() === name.toLowerCase()
        );
        if (!hit) return null;
        const point = CITY_COORDS[hit];
        return { name, x: point.x, y: point.y, hubs: "EVUDDY hub live" };
      })
      .filter((item): item is CityMark => Boolean(item));

    return fromApi.length > 0 ? fromApi : FALLBACK_CITIES;
  }, [liveCities]);

  return (
    <section id="network" className="relative overflow-hidden bg-[#F3F6F8] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,#E5E7EB_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-[#18B368]" />
              EVUDDY NETWORK
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
              At every hub.{" "}
              <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
                Across the map.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
              Tap a city to see EVUDDY on the ground — pickup yards, live GPS rides and a clean electric street you can book today.
            </p>
            <div className="mt-6 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm">
              <p className="text-lg font-black text-[#0F172A]">{active.name}</p>
              <p className="mt-1 text-sm font-semibold text-[#18B368]">{active.hubs}</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[28px] border border-white bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6"
          >
            <svg viewBox="0 0 480 540" className="mx-auto h-auto w-full max-w-[520px]">
              <path d={INDIA} fill="#0B3A4A" transform="translate(8 16)" />
              <path d={INDIA} fill="#123A56" />
              <path d={INDIA} fill="none" stroke="#18B368" strokeWidth="7" strokeLinejoin="round" />
              {marks.map((city) => {
                const on = active.name === city.name;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onClick={() => setActive(city)}
                    onMouseEnter={() => setActive(city)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 16 : 11} fill="#18B368" opacity={on ? 0.28 : 0.16} />
                    <circle cx={city.x} cy={city.y} r={on ? 7 : 5} fill="#18B368" />
                    {on ? (
                      <g>
                        <rect
                          x={city.x > 300 ? city.x - 162 : city.x + 14}
                          y={city.y < 50 ? city.y + 12 : city.y - 34}
                          width="148"
                          height="44"
                          rx="10"
                          fill="#E7F8EE"
                        />
                        <text
                          x={city.x > 300 ? city.x - 150 : city.x + 26}
                          y={city.y < 50 ? city.y + 30 : city.y - 16}
                          fill="#0F172A"
                          fontSize="13"
                          fontWeight="800"
                        >
                          {city.name}
                        </text>
                        <text
                          x={city.x > 300 ? city.x - 150 : city.x + 26}
                          y={city.y < 50 ? city.y + 46 : city.y}
                          fill="#15803D"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {city.hubs}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <IsometricCity />
        </div>
      </div>
    </section>
  );
}
