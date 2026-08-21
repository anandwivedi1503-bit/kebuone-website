"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import EvuddyEcosystem from "./EvuddyEcosystem";
import { INDIA_PATH, INDIA_VIEWBOX } from "./indiaOutline";
import { googleMapsUrl, openGoogleMaps } from "./maps";

type CityMark = {
  name: string;
  x: number;
  y: number;
  hubs: string;
  lat: number;
  lng: number;
};

type LiveHub = {
  hubName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  hubLocation?: string;
};

const CITY_COORDS: Record<string, { x: number; y: number; lat: number; lng: number }> = {
  Srinagar: { x: 117.8, y: 107.04, lat: 34.0837, lng: 74.7973 },
  Delhi: { x: 154.05, y: 189.31, lat: 28.6139, lng: 77.209 },
  Noida: { x: 156.76, y: 190.36, lat: 28.5355, lng: 77.391 },
  Gurugram: { x: 151.34, y: 191.57, lat: 28.4595, lng: 77.0266 },
  Mathura: { x: 160.97, y: 206.16, lat: 27.4924, lng: 77.6737 },
  Agra: { x: 166.08, y: 210.82, lat: 27.1767, lng: 78.0081 },
  Jaipur: { x: 132.69, y: 214.88, lat: 26.9124, lng: 75.7873 },
  Lucknow: { x: 210.3, y: 215.78, lat: 26.8467, lng: 80.9462 },
  Kanpur: { x: 200.97, y: 221.8, lat: 26.4499, lng: 80.3319 },
  Ahmedabad: { x: 84.26, y: 273.38, lat: 23.0225, lng: 72.5714 },
  Surat: { x: 88.17, y: 301.21, lat: 21.1702, lng: 72.8311 },
  Mumbai: { x: 88.93, y: 332.64, lat: 19.076, lng: 72.8777 },
  Pune: { x: 103.67, y: 341.06, lat: 18.5204, lng: 73.8567 },
  Indore: { x: 133.74, y: 277.89, lat: 22.7196, lng: 75.8577 },
  Bhopal: { x: 157.06, y: 269.77, lat: 23.2599, lng: 77.4126 },
  Hyderabad: { x: 173.3, y: 358.06, lat: 17.385, lng: 78.4867 },
  Bengaluru: { x: 159.76, y: 424.53, lat: 12.9716, lng: 77.5946 },
  Bangalore: { x: 159.76, y: 424.53, lat: 12.9716, lng: 77.5946 },
  Chennai: { x: 200.07, y: 422.88, lat: 13.0827, lng: 80.2707 },
  Kolkata: { x: 321.74, y: 280.15, lat: 22.5726, lng: 88.3639 },
  Patna: { x: 273.31, y: 234.73, lat: 25.5941, lng: 85.1376 },
  Chandigarh: { x: 147.58, y: 157.43, lat: 30.7333, lng: 76.7794 },
};

const FALLBACK_CITIES: CityMark[] = [
  { name: "Delhi", x: 154.05, y: 189.31, hubs: "Capital hub live", lat: 28.6139, lng: 77.209 },
  { name: "Mathura", x: 160.97, y: 206.16, hubs: "EVUDDY pickup hub", lat: 27.4924, lng: 77.6737 },
  { name: "Jaipur", x: 132.69, y: 214.88, hubs: "City hub live", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", x: 210.3, y: 215.78, hubs: "Ride & return yard", lat: 26.8467, lng: 80.9462 },
  { name: "Mumbai", x: 88.93, y: 332.64, hubs: "Coastal hub live", lat: 19.076, lng: 72.8777 },
  { name: "Hyderabad", x: 173.3, y: 358.06, hubs: "South hub live", lat: 17.385, lng: 78.4867 },
  { name: "Bengaluru", x: 159.76, y: 424.53, hubs: "Tech city hub", lat: 12.9716, lng: 77.5946 },
];

export default function EvuddyNetwork() {
  const [active, setActive] = useState<CityMark>(FALLBACK_CITIES[1]);
  const [liveCities, setLiveCities] = useState<string[]>([]);
  const [liveHubs, setLiveHubs] = useState<LiveHub[]>([]);

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

    fetch("/api/hubs")
      .then((res) => res.json())
      .then((json) => setLiveHubs(json.data || []))
      .catch(() => setLiveHubs([]));
  }, []);

  const marks = useMemo(() => {
    const fromApi = liveCities
      .map((name) => {
        const hit = Object.keys(CITY_COORDS).find((key) => key.toLowerCase() === name.toLowerCase());
        if (!hit) return null;
        const point = CITY_COORDS[hit];
        const cityHubs = liveHubs.filter((hub) => String(hub.city || "").toLowerCase() === name.toLowerCase());
        return {
          name,
          x: point.x,
          y: point.y,
          lat: cityHubs[0]?.latitude || point.lat,
          lng: cityHubs[0]?.longitude || point.lng,
          hubs: cityHubs[0]?.hubName ? `${cityHubs[0].hubName} · open in Maps` : "EVUDDY hub live · open in Maps",
        };
      })
      .filter((item): item is CityMark => Boolean(item));

    return fromApi.length > 0 ? fromApi : FALLBACK_CITIES;
  }, [liveCities, liveHubs]);

  const selectCity = (city: CityMark, openMaps: boolean) => {
    setActive(city);
    if (openMaps) openGoogleMaps(city.lat, city.lng, `EVUDDY ${city.name}`);
  };

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
              Tap a city to see the hub, then it opens in Google Maps — pickup yards you can actually navigate to.
            </p>
            <div className="mt-6 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0F172A] text-sm font-black text-[#6EE7A8]">
                  {active.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-lg font-black text-[#0F172A]">{active.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#18B368]">{active.hubs}</p>
                </div>
              </div>
              <a
                href={googleMapsUrl(active.lat, active.lng, `EVUDDY ${active.name}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#18B368] text-sm font-bold text-white"
              >
                Open {active.name} in Google Maps
              </a>
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
                const tipY = city.y < 70 ? city.y + 14 : city.y - 52;
                return (
                  <g
                    key={city.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(city)}
                    onClick={() => selectCity(city, true)}
                  >
                    <circle cx={city.x} cy={city.y} r={on ? 18 : 12} fill="#18B368" opacity={on ? 0.28 : 0.16} />
                    <circle cx={city.x} cy={city.y} r={on ? 7 : 5} fill="#18B368" />
                    {on ? (
                      <g>
                        <rect x={tipX} y={tipY} width="158" height="58" rx="10" fill="#E7F8EE" />
                        <text x={tipX + 12} y={tipY + 20} fill="#0F172A" fontSize="13" fontWeight="800">
                          {city.name}
                        </text>
                        <text x={tipX + 12} y={tipY + 36} fill="#15803D" fontSize="10" fontWeight="600">
                          {city.hubs}
                        </text>
                        <text x={tipX + 12} y={tipY + 50} fill="#0F172A" fontSize="9" fontWeight="700">
                          Open Google Maps →
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </motion.div>
        </div>

        <div className="-mx-4 mt-8 overflow-hidden rounded-none border-y border-white bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:mx-0 sm:rounded-[28px] sm:border">
          <EvuddyEcosystem />
        </div>
      </div>
    </section>
  );
}
