"use client";

import { BRAND } from "@/lib/brandMedia";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

const SLIDES = [
  { src: BRAND.rider, kicker: "On the road", title: "Ride the city" },
  { src: BRAND.city, kicker: "Live GPS", title: "Tracked while you ride" },
  { src: BRAND.yard, kicker: "Hub pickup", title: "OTP at the yard" },
  { src: BRAND.houseParked, kicker: "Rent to Own", title: "Park it at home" },
];

export default function Hero() {
  const { catalog } = useHomeCatalog();
  const [slide, setSlide] = useState(0);
  const cityLine =
    catalog.cities.length > 0
      ? catalog.cities.map((city) => city.cityName).join(" · ")
      : "Live hub";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const active = SLIDES[slide];

  return (
    <section id="home" className="relative overflow-x-hidden scroll-mt-28 bg-[#F7F4EE] sm:scroll-mt-40">
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

        <div className="relative overflow-hidden bg-[#EDE8DE]">
          <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[440px]">
            {SLIDES.map((item, index) => (
              <img
                key={item.src}
                src={item.src}
                alt={item.title}
                className={`absolute inset-0 h-full w-full object-contain object-center p-6 transition-opacity duration-700 ${
                  index === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#E4DDD2] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#5F6B63]">
              {active.kicker}
            </p>
            <div className="flex gap-2">
              {SLIDES.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  aria-label={item.title}
                  onClick={() => setSlide(index)}
                  className={`h-1.5 w-6 transition ${
                    index === slide ? "bg-[#1F6B4A]" : "bg-[#1C1917]/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid border border-[#E4DDD2] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[240px] bg-[#EDE8DE] p-6">
            <img
              src={BRAND.city}
              alt="GPS-enabled EVUDDY yellow scooter on an Indian road"
              className="h-full max-h-[280px] w-full object-contain object-center"
            />
          </div>
          <div className="flex flex-col justify-center bg-[#FBF9F5] px-6 py-8 sm:px-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
              Live GPS on the scooter
            </p>
            <h2 className="font-display mt-3 text-3xl font-medium text-[#1C1917]">
              Lock, battery and location while you ride.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5C635E]">
              {cityLine}. Same IoT feed the yard uses — not a toy map.
            </p>
            <Link href="/ride-options" className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-[#1F6B4A]">
              Book from a live hub
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
