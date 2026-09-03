"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FLEET_INVESTMENT, FLEET_INVESTMENT_STARTER } from "@/lib/fleetInvestment";

const INVEST = FLEET_INVESTMENT.pageHref;

export default function InvestHomeInvite() {
  return (
    <section className="bg-[#06140F] py-20 text-white sm:py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[160px_1fr_auto]">
        <Link href={INVEST} className="mx-auto w-full max-w-[140px] overflow-hidden bg-white lg:mx-0">
          <img
            src={FLEET_INVESTMENT.posterSrc}
            alt="EVUDDY Fleet Partner Investment poster"
            width={320}
            height={480}
            className="h-auto w-full object-cover"
          />
        </Link>
        <div>
          <p className="ev-kicker">Fleet Partner Investment</p>
          <h3 className="ev-display mt-3 text-3xl sm:text-5xl">
            From ₹1 lakh. You earn {FLEET_INVESTMENT.investorSharePercent}%.
            <span className="italic text-[#18B368]"> {FLEET_INVESTMENT.tenureMonths} months.</span>
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
            Official poster: ₹1L returns {FLEET_INVESTMENT_STARTER.totalLabel} · ₹5L / ₹10L plans · then
            apply on Invest.
          </p>
        </div>
        <Link href={INVEST} className="ev-cta w-full lg:w-auto">
          Open Invest
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
