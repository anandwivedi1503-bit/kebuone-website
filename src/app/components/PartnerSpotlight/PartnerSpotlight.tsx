"use client";

import Link from "next/link";
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
  return (
    <section id="dealer-network" className="scroll-mt-36 bg-[#F7F4EE] py-16 sm:py-20">
      <div id="fleet-investment" className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Partner with EVUDDY
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Dealer. Distributor. <span className="italic text-[#1F6B4A]">Fleet partner.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5C635E]">
          Three ways in. Full-frame photos — nothing cropped. Pick a path and apply.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {ads.map((item) => (
            <article
              key={item.kicker}
              className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E4DDD2] bg-white shadow-[0_24px_60px_rgba(28,25,23,0.06)]"
            >
              <div className="flex aspect-[16/10] items-center justify-center bg-[#F4F0E6] p-4">
                <HomeImg
                  src={item.image}
                  alt=""
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1F6B4A]">
                  {item.kicker}
                </p>
                <h3 className="font-display mt-2 text-2xl font-medium leading-tight text-[#1C1917]">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#5C635E]">{item.text}</p>
                {item.download ? (
                  <a
                    href={item.href}
                    download={FLEET_INVESTMENT.pdfFileName}
                    className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F4C430] px-5 text-[13px] font-semibold tracking-[0.06em] text-[#0B1B16]"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1F6B4A] px-5 text-[13px] font-semibold tracking-[0.06em] text-white"
                  >
                    {item.cta} →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
