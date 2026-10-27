"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import FleetPartnerDesignedPoster from "../FleetPartner/FleetPartnerDesignedPoster";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";

/** Homepage teaser — one poster, no duplicate slide. Full story on /partners */
export default function PartnerSpotlight() {
  return (
    <section id="fleet-investment" className="scroll-mt-36 border-t border-[#E4DDD2] bg-[#F7F4EE] py-14 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1F6B4A]">
          Fleet partner · Invest
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-[clamp(1.65rem,4.5vw,2.75rem)] font-medium tracking-[-0.03em] text-[#1C1917]">
          Grow the yellow EV fleet with EVUDDY
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#5C635E] sm:text-[15px]">
          One clear brief, one application — we operate hubs, riders, and IoT on the platform.
        </p>

        <div className="mt-8 max-w-3xl">
          <FleetPartnerDesignedPoster />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={FLEET_INVESTMENT.pdfHref}
            download={FLEET_INVESTMENT.pdfFileName}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#18B368] px-7 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(24,179,104,0.28)] transition hover:bg-[#14a05c]"
          >
            <Download size={17} />
            Download partner PDF
          </a>
          <Link
            href="/partners#partner-form"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0A1134]/12 bg-white px-7 text-sm font-semibold text-[#0A1134] transition hover:border-[#18B368]/40"
          >
            Apply as partner
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
