"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FLEET_INVESTMENT, FLEET_INVESTMENT_STARTER } from "@/lib/fleetInvestment";

const INVEST = FLEET_INVESTMENT.pageHref;

export default function InvestHomeInvite() {
  return (
    <section className="bg-[#F7F4EE] py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-8 border-y border-[#E4DDD2] py-10 sm:grid-cols-[140px_1fr_auto] sm:py-12">
          <Link href={`${INVEST}`} className="relative mx-auto w-full max-w-[140px] sm:mx-0">
            <img
              src={FLEET_INVESTMENT.posterSrc}
              alt="EVUDDY Fleet Partner Investment poster"
              width={320}
              height={480}
              className="h-auto w-full object-contain"
            />
          </Link>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">
              Fleet Partner Investment
            </p>
            <h3 className="font-display mt-2 text-2xl font-medium tracking-tight text-[#1C1917] sm:text-3xl">
              From ₹1 lakh. You earn {FLEET_INVESTMENT.investorSharePercent}%.{" "}
              {FLEET_INVESTMENT.tenureMonths} months.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#5C635E]">
              Official poster: ₹1L returns {FLEET_INVESTMENT_STARTER.totalLabel} · ₹5L / ₹10L plans · then
              apply on Invest.
            </p>
          </div>
          <Link
            href={INVEST}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#1F6B4A] px-7 text-[13px] font-medium tracking-[0.08em] text-white transition hover:bg-[#18573c] sm:w-auto"
          >
            Open Invest
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
