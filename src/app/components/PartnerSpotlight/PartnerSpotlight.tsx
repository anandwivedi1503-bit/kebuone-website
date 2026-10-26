"use client";

import Link from "next/link";
import { Download, Sparkles } from "lucide-react";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import HomeImg from "../HomeMedia/HomeImg";

export default function PartnerSpotlight() {
  return (
    <section id="dealer-network" className="scroll-mt-36 bg-white py-16 sm:py-22">
      <div
        id="fleet-investment"
        className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Fleet partner investment
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          Grow India&apos;s yellow EV fleet with{" "}
          <span className="italic text-[#1F6B4A]">EVUDDY</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5C635E]">
          Official investment brief — read online or download. Apply on the partners form when
          you are ready. No payment on this website.
        </p>

        <div className="mt-10 overflow-hidden rounded-[32px] border border-[#E4DDD2] bg-[#F7F4EE] shadow-[0_28px_80px_rgba(28,25,23,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-[#E4DDD2] bg-white p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 text-[#1F6B4A]">
                <Sparkles size={18} strokeWidth={1.5} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Official poster
                </span>
              </div>
              <HomeImg
                src={FLEET_INVESTMENT.posterSrc}
                alt="EVUDDY fleet partner investment brief"
                className="mt-5 w-full rounded-2xl border border-[#E4DDD2] object-contain shadow-sm"
              />
            </div>

            <div className="flex flex-col p-5 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B736E]">
                Full brief (PDF)
              </p>
              <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-[#E4DDD2] bg-[#FAFAF8]">
                <iframe
                  title="EVUDDY fleet partner investment PDF"
                  src={`${FLEET_INVESTMENT.pdfHref}#view=FitH`}
                  className="h-[min(52vh,420px)] w-full bg-white"
                />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={FLEET_INVESTMENT.pdfHref}
                  download={FLEET_INVESTMENT.pdfFileName}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1F6B4A] px-6 text-[13px] font-semibold tracking-[0.06em] text-white transition hover:bg-[#18573c]"
                >
                  <Download size={17} />
                  Download PDF
                </a>
                <Link
                  href="/partners#partner-form"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#1C1917]/12 bg-white px-6 text-[13px] font-semibold tracking-[0.06em] text-[#1C1917] transition hover:border-[#1F6B4A]/40"
                >
                  Apply as fleet partner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
