"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { BRAND } from "@/lib/brandMedia";
import { dealerProgram } from "@/lib/dealerProgram";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import HomeImg from "../HomeMedia/HomeImg";

const cards = [
  {
    kicker: "Dealer",
    title: `Retail dealers from ${dealerProgram.dealerMin}`,
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

export default function PartnerSpotlight({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      id="dealer-network"
      className={`scroll-mt-36 bg-[#F7F4EE] ${compact ? "py-8 sm:py-12" : "py-12 sm:py-16"}`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {!compact ? (
          <>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
              Grow with EVUDDY
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
              Dealer, distributor, <span className="italic text-[#1F6B4A]">or fleet partner.</span>
            </h2>
          </>
        ) : null}

        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-8 lg:grid lg:grid-cols-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {cards.map((card) => {
            const inner = (
              <>
                <HomeImg
                  src={card.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B16] via-[#0B1B16]/50 to-transparent" />
                <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6 text-white sm:min-h-[300px] sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                    {card.kicker}
                  </p>
                  <h3 className="font-display mt-2 text-2xl font-medium leading-snug sm:text-[1.7rem]">
                    {card.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">{card.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium">
                    {card.download ? <Download size={15} /> : null}
                    {card.cta} →
                  </span>
                </div>
              </>
            );

            const cls =
              "group relative isolate min-w-[min(100%,320px)] snap-center overflow-hidden rounded-[28px] lg:min-w-0";

            if (card.download) {
              return (
                <a
                  key={card.kicker}
                  href={card.href}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className={cls}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link key={card.kicker} href={card.href} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
