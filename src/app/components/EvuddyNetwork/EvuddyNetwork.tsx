"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import EvuddyEcosystem from "./EvuddyEcosystem";
import { INDIA_PATH, INDIA_VIEWBOX } from "./indiaOutline";

type CityMark = {
  name: string;
  x: number;
  y: number;
  hubs: string;
};

/** Projected from real lon/lat onto the India mainland SVG. */
const CITY_COORDS: Record<string, { x: number; y: number }> = {
  Srinagar: { x: 117.8, y: 107.04 },
  Delhi: { x: 154.05, y: 189.31 },
  Noida: { x: 156.76, y: 190.36 },
  Gurugram: { x: 151.34, y: 191.57 },
  Mathura: { x: 160.97, y: 206.16 },
  Agra: { x: 166.08, y: 210.82 },
  Jaipur: { x: 132.69, y: 214.88 },
  Lucknow: { x: 210.3, y: 215.78 },
  Kanpur: { x: 200.97, y: 221.8 },
  Ahmedabad: { x: 84.26, y: 273.38 },
  Surat: { x: 88.17, y: 301.21 },
  Mumbai: { x: 88.93, y: 332.64 },
  Pune: { x: 103.67, y: 341.06 },
  Indore: { x: 133.74, y: 277.89 },
  Bhopal: { x: 157.06, y: 269.77 },
  Hyderabad: { x: 173.3, y: 358.06 },
  Bengaluru: { x: 159.76, y: 424.53 },
  Bangalore: { x: 159.76, y: 424.53 },
  Chennai: { x: 200.07, y: 422.88 },
  Kolkata: { x: 321.74, y: 280.15 },
  Patna: { x: 273.31, y: 234.73 },
  Chandigarh: { x: 147.58, y: 157.43 },
};

const FALLBACK_CITIES: CityMark[] = [
  { name: "Delhi", x: 154.05, y: 189.31, hubs: "Capital hub live" },
  { name: "Mathura", x: 160.97, y: 206.16, hubs: "EVUDDY pickup hub" },
  { name: "Jaipur", x: 132.69, y: 214.88, hubs: "City hub live" },
  { name: "Lucknow", x: 210.3, y: 215.78, hubs: "Ride & return yard" },
  { name: "Mumbai", x: 88.93, y: 332.64, hubs: "Coastal hub live" },
  { name: "Hyderabad", x: 173.3, y: 358.06, hubs: "South hub live" },
  { name: "Bengaluru", x: 159.76, y: 424.53, hubs: "Tech city hub" },
];

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
        const hit = Object.keys(CITY_COORDS).find((key) => key.toLowerCase() === name.toLowerCase());
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
                Across India.
              </span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
              Tap a city on the map — then see the EVUDDY ecosystem on the ground: branded hub, pickup yard, live GPS
              street and the same scooter you book today.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0F172A] text-sm font-black text-[#6EE7A8]">
                {active.name.slice(0, 1)}
              </span>
              <div>
                <p className="text-lg font-black text-[#0F172A]">{active.name}</p>
                <p className="mt-0.5 text-sm font-semibold text-[#18B368]">{active.hubs}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[28px] border border-white bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6"
          >
            <svg viewBox={INDIA_VIEWBOX} className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-label="Map of India with EVUDDY hub cities">
              <ellipse cx="240" cy="530" rx="150" ry="14" fill="#0F172A" opacity="0.08" />
              <path d={INDIA_PATH} fill="#071822" transform="translate(11 16)" />
              <path d={INDIA_PATH} fill="#123A56" />
              <path d={INDIA_PATH} fill="none" stroke="#18B368" strokeWidth="5.5" strokeLinejoin="round" />
              {marks.map((city) => {
                const on = active.name === city.name;
                const tipX = city.x > 300 ? city.x - 162 : city.x + 14;
                const tipY = city.y < 70 ? city.y + 14 : city.y - 38;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onClick={() => setActive(city)}
                    onMouseEnter={() => setActive(city)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 18 : 12} fill="#18B368" opacity={on ? 0.28 : 0.16} />
                    <circle cx={city.x} cy={city.y} r={on ? 7 : 5} fill="#18B368" />
                    {on ? (
                      <g>
                        <rect x={tipX} y={tipY} width="148" height="46" rx="10" fill="#E7F8EE" />
                        <text x={tipX + 12} y={tipY + 20} fill="#0F172A" fontSize="13" fontWeight="800">
                          {city.name}
                        </text>
                        <text x={tipX + 12} y={tipY + 36} fill="#15803D" fontSize="10" fontWeight="600">
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
          <EvuddyEcosystem />
        </div>
      </div>
    </section>
  );
}
