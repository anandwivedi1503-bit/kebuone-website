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
    image: BRAND.yard,
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
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const ad = ads[slide];

  const ctaClass =
    "mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0B1B16]";

  return (
    <section id="dealer-network" className="scroll-mt-36 bg-[#F7F4EE] py-12 sm:py-16">
      <div id="fleet-investment" className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Grow with EVUDDY
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Dealer, distributor, <span className="italic text-[#1F6B4A]">or fleet partner.</span>
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#5C635E]">
          One advertisement. It changes on its own — dealer, distributor, then invest with Download PDF.
        </p>

        <div
          className="relative mt-8 min-h-[320px] overflow-hidden rounded-[28px] sm:min-h-[400px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B16] via-[#0B1B16]/50 to-transparent" />
          <div className="relative z-[1] flex min-h-[320px] flex-col justify-end p-6 text-white sm:min-h-[400px] sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                {ad.kicker}
              </p>
              <p className="text-[11px] tracking-[0.12em] text-white/70">
                {slide + 1} of {ads.length}
              </p>
            </div>
            <h3 className="font-display max-w-lg text-3xl font-medium leading-snug sm:text-4xl">{ad.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/80">{ad.text}</p>
            {ad.download ? (
              <a href={ad.href} download={FLEET_INVESTMENT.pdfFileName} className={ctaClass}>
                <Download size={15} />
                {ad.cta}
              </a>
            ) : (
              <Link href={ad.href} className={ctaClass}>
                {ad.cta} →
              </Link>
            )}
            <div className="mt-6 flex gap-2">
              {ads.map((item, index) => (
                <button
                  key={item.kicker}
                  type="button"
                  aria-label={`Show ${item.kicker}`}
                  onClick={() => setSlide(index)}
                  className={`h-1.5 rounded-full transition ${
                    index === slide ? "w-8 bg-white" : "w-4 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
