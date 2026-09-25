"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { BRAND } from "@/lib/brandMedia";
import { dealerProgram } from "@/lib/dealerProgram";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import HomeImg from "../HomeMedia/HomeImg";

const ads = [
  {
    kicker: "Become a dealer",
    title: `Retail EVUDDY from ${dealerProgram.dealerMin}`,
    text: "City showroom. Sell and rent yellow scooters. KYC and OTP stay on our platform.",
    cta: "Apply now",
    href: "/partners/dealer",
    image: BRAND.dealer,
    download: false,
    theme: "yellow",
  },
  {
    kicker: "Become a distributor",
    title: `Supply dealers from ${dealerProgram.distributorMin}`,
    text: "Territory warehouse and brand standards for authorised dealers.",
    cta: "Apply now",
    href: "/partners/distributor",
    image: BRAND.distributor,
    download: false,
    theme: "green",
  },
  {
    kicker: "Fleet partner",
    title: "Put your capital on the yellow fleet",
    text: "We operate every kilometre. You grow the fleet. Numbers live in the official brief.",
    cta: "Download PDF",
    href: FLEET_INVESTMENT.pdfHref,
    image: BRAND.yard,
    download: true,
    theme: "dark",
  },
] as const;

const themes = {
  yellow: "bg-[#F4C430] text-[#1C1917]",
  green: "bg-[#146C3A] text-white",
  dark: "bg-[#0B1B16] text-white",
} as const;

export default function PartnerSpotlight() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % ads.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const ad = ads[slide];
  const onDark = ad.theme !== "yellow";

  return (
    <section id="dealer-network" className="scroll-mt-36 bg-[#F7F4EE] py-10 sm:py-14">
      <div id="fleet-investment" className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div
          className={`grid overflow-hidden rounded-[28px] lg:grid-cols-[1.15fr_0.85fr] ${themes[ad.theme]}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex flex-col justify-between p-6 sm:p-10">
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  onDark ? "text-white/70" : "text-[#1C1917]/70"
                }`}
              >
                Advertisement · {slide + 1} of {ads.length}
              </p>
              <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.14em]">{ad.kicker}</p>
              <h2 className="font-display mt-3 max-w-xl text-3xl font-medium leading-[1.1] tracking-[-0.03em] sm:text-5xl">
                {ad.title}
              </h2>
              <p className={`mt-4 max-w-lg text-[15px] leading-7 ${onDark ? "text-white/80" : "text-[#1C1917]/80"}`}>
                {ad.text}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {ad.download ? (
                <a
                  href={ad.href}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[13px] font-semibold ${
                    onDark ? "bg-white text-[#0B1B16]" : "bg-[#1C1917] text-white"
                  }`}
                >
                  <Download size={16} />
                  Download PDF
                </a>
              ) : (
                <Link
                  href={ad.href}
                  className={`inline-flex min-h-12 items-center rounded-full px-6 text-[13px] font-semibold ${
                    onDark ? "bg-white text-[#0B1B16]" : "bg-[#1C1917] text-white"
                  }`}
                >
                  {ad.cta} →
                </Link>
              )}
              <div className="flex gap-2">
                {ads.map((item, index) => (
                  <button
                    key={item.kicker}
                    type="button"
                    aria-label={item.kicker}
                    onClick={() => setSlide(index)}
                    className={`h-2 rounded-full transition ${
                      index === slide
                        ? onDark
                          ? "w-8 bg-white"
                          : "w-8 bg-[#1C1917]"
                        : onDark
                          ? "w-2 bg-white/40"
                          : "w-2 bg-[#1C1917]/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="relative min-h-[220px] lg:min-h-[360px]">
            {ads.map((item, index) => (
              <HomeImg
                key={item.kicker}
                src={item.image}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
                  index === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
