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
    kicker: "Dealer",
    title: `Retail EVUDDY from ${dealerProgram.dealerMin}`,
    text: "City showroom or pickup point. Sell and rent yellow scooters to riders.",
    cta: "Apply as dealer",
    href: "/partners/dealer",
    image: BRAND.dealer,
    download: false,
  },
  {
    kicker: "Distributor",
    title: `Supply dealers from ${dealerProgram.distributorMin}`,
    text: "Territory warehouse and brand standards for authorised dealers.",
    cta: "Apply as distributor",
    href: "/partners/distributor",
    image: BRAND.distributor,
    download: false,
  },
  {
    kicker: "Invest",
    title: "Put your capital on the yellow fleet",
    text: "EVUDDY operates every kilometre. Download the brief, then apply.",
    cta: "Download PDF",
    href: FLEET_INVESTMENT.pdfHref,
    image: BRAND.franchise,
    download: true,
  },
] as const;

export default function PartnerSpotlight() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % ads.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [paused]);

  const ad = ads[slide];

  return (
    <section id="dealer-network" className="scroll-mt-36 bg-[#F7F4EE] py-16 sm:py-20">
      <div id="fleet-investment" className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Partner with EVUDDY
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Dealer. Distributor. <span className="italic text-[#1F6B4A]">Fleet partner.</span>
        </h2>

        <div
          className="relative mt-8 min-h-[340px] overflow-hidden sm:min-h-[420px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {ads.map((item, index) => (
            <HomeImg
              key={item.kicker}
              src={item.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${
                index === slide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B16] via-[#0B1B16]/55 to-[#0B1B16]/10" />
          <div className="relative z-[1] flex min-h-[340px] flex-col justify-end p-6 text-white sm:min-h-[420px] sm:p-10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F4C430]">
                {ad.kicker}
              </p>
              <p className="text-[11px] tracking-[0.14em] text-white/70">
                {slide + 1} / {ads.length}
              </p>
            </div>
            <h3 className="font-display max-w-xl text-3xl font-medium leading-tight sm:text-5xl">{ad.title}</h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">{ad.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {ad.download ? (
                <a
                  href={ad.href}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className="inline-flex min-h-12 items-center gap-2 bg-[#F4C430] px-6 text-[13px] font-semibold tracking-[0.06em] text-[#0B1B16]"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              ) : (
                <Link
                  href={ad.href}
                  className="inline-flex min-h-12 items-center bg-white px-6 text-[13px] font-semibold tracking-[0.06em] text-[#0B1B16]"
                >
                  {ad.cta} →
                </Link>
              )}
              <div className="flex gap-1.5">
                {ads.map((item, index) => (
                  <button
                    key={item.kicker}
                    type="button"
                    aria-label={item.kicker}
                    onClick={() => setSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      index === slide ? "w-8 bg-[#F4C430]" : "w-3 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
