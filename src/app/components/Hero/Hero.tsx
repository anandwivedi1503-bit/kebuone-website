"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { googleMapsUrl } from "../EvuddyNetwork/maps";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

const PARTNERS = [
  { name: "Flipkart", src: "/partners/flipkart.png" },
  { name: "Swiggy", src: "/partners/swiggy.png" },
  { name: "Zomato", src: "/partners/zomato.png" },
  { name: "Blinkit", src: "/partners/blinkit.svg" },
  { name: "Zepto", src: "/partners/zepto.svg" },
  { name: "Instamart", src: "/partners/instamart.jpg" },
];

type LiveHub = {
  hubName?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

export default function Hero() {
  const { catalog } = useHomeCatalog();
  const [hubs, setHubs] = useState<LiveHub[]>([]);

  useEffect(() => {
    fetch("/api/hubs")
      .then((res) => res.json())
      .then((json) => setHubs(Array.isArray(json.data) ? json.data : []))
      .catch(() => setHubs([]));
  }, []);

  const liveHubs = hubs.filter((hub) => {
    const lat = Number(hub.latitude);
    const lng = Number(hub.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });
  const startHub = liveHubs[0];
  const endHub = liveHubs[1] || liveHubs[0];
  const startLat = Number(startHub?.latitude) || 26.8467;
  const startLng = Number(startHub?.longitude) || 80.9462;
  const endLat = Number(endHub?.latitude) || 26.8467;
  const endLng = Number(endHub?.longitude) || 80.9462;
  const startLabel = startHub?.hubName || startHub?.city || "HUB";
  const endLabel = endHub?.hubName || endHub?.city || "YARD";
  const cityLine =
    catalog.cities.length > 0
      ? catalog.cities.map((city) => city.cityName).join(" · ")
      : "Live hub";

  return (
    <section id="home" className="relative overflow-x-hidden scroll-mt-28 bg-[#F7F4EE] sm:scroll-mt-40">
      <style>{`
        @keyframes evuddy-draw {
          0% { stroke-dashoffset: 900; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes evuddy-dash {
          to { stroke-dashoffset: -48; }
        }
        .evuddy-draw { stroke-dasharray: 900; animation: evuddy-draw 3.2s ease forwards; }
        .evuddy-dash { stroke-dasharray: 6 10; animation: evuddy-dash 1.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .evuddy-draw, .evuddy-dash { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-10 pt-28 sm:px-8 sm:pt-40 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:pb-16 lg:pt-44">
        <div className="max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#5F6B63]">
            India&apos;s smart EV rental
          </p>
          <h1 className="font-display mt-5 text-[clamp(2.6rem,7vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#1C1917]">
            Ride the city.
            <span className="mt-1 block italic text-[#1F6B4A]">Own the journey.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5C635E] sm:text-base sm:leading-8">
            Book an EVUDDY scooter from a live hub — hourly to monthly, or Rent to Own.
            <span className="mt-2 block text-[#1F6B4A]">
              मिनटों में बुक करें. शहर घूमें. राइड अपना बनाएँ.
            </span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/ride-options">
              <span className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#1F6B4A] px-8 text-[13px] font-medium tracking-[0.08em] text-white transition hover:bg-[#18573c] sm:w-auto">
                Book an EV
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/ride-options">
              <span className="inline-flex min-h-12 w-full items-center justify-center border border-[#1C1917]/15 bg-transparent px-8 text-[13px] font-medium tracking-[0.06em] text-[#1C1917] transition hover:border-[#1F6B4A] sm:w-auto">
                Rent to Own ₹280/day
              </span>
            </Link>
          </div>
        </div>

        <Link href="/ride-options" className="relative block overflow-hidden">
          <img
            src="/new-vehicle.jpeg"
            alt="EVUDDY electric scooter"
            className="aspect-[4/5] w-full object-cover object-[50%_58%] sm:aspect-[5/4] lg:min-h-[420px] lg:aspect-[4/3]"
          />
          <span className="absolute bottom-4 left-4 text-[11px] font-medium uppercase tracking-[0.22em] text-white">
            Live in city
          </span>
        </Link>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid border border-[#E4DDD2] lg:grid-cols-[0.38fr_0.62fr]">
          <div className="relative hidden min-h-[240px] lg:block">
            <img
              src="/new-vehicle.jpeg"
              alt="GPS-enabled EVUDDY scooter"
              className="absolute inset-0 h-full w-full object-cover object-[48%_58%]"
            />
            <p className="absolute bottom-5 left-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white">
              GPS on scooter
            </p>
          </div>
          <div className="bg-[#FBF9F5] px-5 py-5 sm:px-8 sm:py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
                Live GPS tracking
              </p>
              <p className="max-w-[60%] text-right text-[11px] leading-4 tracking-[0.08em] text-[#1F6B4A]">
                {cityLine} · In ride
              </p>
            </div>
            <div className="relative h-[200px] sm:h-[240px]">
              <svg viewBox="0 0 960 240" className="h-full w-full overflow-visible" fill="none" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M80 150 C 220 70, 340 210, 500 120 S 760 200, 880 135"
                  stroke="#E4DDD2"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  id="evuddy-route"
                  className="evuddy-draw"
                  d="M80 150 C 220 70, 340 210, 500 120 S 760 200, 880 135"
                  stroke="#1F6B4A"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  className="evuddy-dash"
                  d="M80 150 C 220 70, 340 210, 500 120 S 760 200, 880 135"
                  stroke="#1C1917"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.35"
                />
                <a href={googleMapsUrl(startLat, startLng, `EVUDDY ${startLabel}`)} target="_blank" rel="noreferrer">
                  <circle cx="80" cy="150" r="5" fill="#1F6B4A" />
                  <text x="80" y="178" textAnchor="middle" fill="#5F6B63" fontSize="11" letterSpacing="1.5">
                    HUB
                  </text>
                </a>
                <a href={googleMapsUrl(endLat, endLng, `EVUDDY ${endLabel}`)} target="_blank" rel="noreferrer">
                  <circle cx="880" cy="135" r="5" fill="#1C1917" />
                  <text x="880" y="163" textAnchor="middle" fill="#5F6B63" fontSize="11" letterSpacing="1.5">
                    YARD
                  </text>
                </a>
                <g>
                  <animateMotion dur="10s" repeatCount="indefinite" rotate="0">
                    <mpath href="#evuddy-route" />
                  </animateMotion>
                  <circle r="4" fill="#1F6B4A" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-14 pb-4">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.28em] text-[#8A847A]">
            Delivery partners
          </p>
          <div className="mt-8 grid grid-cols-2 items-center gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {PARTNERS.map((item) => (
              <span key={item.name} className="flex flex-col items-center gap-2">
                <img src={item.src} alt={item.name} className="max-h-7 max-w-[96px] object-contain opacity-70 grayscale" />
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8A847A]">{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
