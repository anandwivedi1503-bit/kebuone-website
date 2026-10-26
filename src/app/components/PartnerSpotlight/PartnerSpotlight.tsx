"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ExternalLink } from "lucide-react";

import FleetPartnerDesignedPoster from "../FleetPartner/FleetPartnerDesignedPoster";
import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import HomeImg from "../HomeMedia/HomeImg";

export default function PartnerSpotlight() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="dealer-network" className="scroll-mt-36 bg-white py-14 sm:py-20">
      <div
        id="fleet-investment"
        className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Fleet partner investment
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-[clamp(1.75rem,5vw,3rem)] font-medium tracking-[-0.03em] text-[#1C1917]">
          Grow India&apos;s yellow EV fleet with{" "}
          <span className="italic text-[#1F6B4A]">EVUDDY</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5C635E]">
          New web poster plus your original presentation slide. Open or download the official PDF
          anytime — apply on the partners form when ready.
        </p>

        <div className="mt-8 space-y-8">
          <FleetPartnerDesignedPoster />

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border border-[#E4DDD2] bg-[#F7F4EE] p-5 sm:p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B736E]">
              Original presentation poster
            </p>
            <p className="mt-2 text-sm text-[#5C635E]">
              From your fleet partner PDF deck — kept exactly as supplied.
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#E4DDD2] bg-white p-3 sm:p-4">
              <HomeImg
                src={FLEET_INVESTMENT.posterSrc}
                alt="Original EVUDDY fleet partner presentation poster"
                className="mx-auto w-full max-h-[min(70vh,520px)] object-contain object-center"
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={FLEET_INVESTMENT.pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-6 text-[13px] font-semibold text-white transition hover:bg-[#18573c]"
              >
                <ExternalLink size={17} />
                Open PDF
              </a>
              <a
                href={FLEET_INVESTMENT.pdfHref}
                download={FLEET_INVESTMENT.pdfFileName}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#1C1917]/12 bg-white px-6 text-[13px] font-semibold text-[#1C1917]"
              >
                <Download size={17} />
                Download PDF
              </a>
              <Link
                href="/partners#partner-form"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#1F6B4A]/30 bg-[#E8F3EC] px-6 text-[13px] font-semibold text-[#146C3A]"
              >
                Apply as partner
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
