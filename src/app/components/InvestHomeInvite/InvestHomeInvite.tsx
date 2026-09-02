"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FLEET_INVESTMENT, FLEET_INVESTMENT_STARTER } from "@/lib/fleetInvestment";

const INVEST = FLEET_INVESTMENT.pageHref;

export default function InvestHomeInvite() {
  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-stretch justify-between gap-5 rounded-[28px] border border-white/10 bg-[#0B1B16] px-5 py-6 text-white sm:flex-row sm:items-center sm:px-8 sm:py-8">
          <Link
            href={`${INVEST}`}
            className="relative mx-auto w-full max-w-[140px] shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-md sm:mx-0 sm:max-w-[160px]"
          >
            <img
              src={FLEET_INVESTMENT.posterSrc}
              alt="EVUDDY Fleet Partner Investment poster"
              width={320}
              height={480}
              className="h-auto w-full object-cover"
            />
          </Link>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7A8]">
              Fleet Partner Investment
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              From ₹1 lakh. You earn {FLEET_INVESTMENT.investorSharePercent}%.{" "}
              {FLEET_INVESTMENT.tenureMonths} months.
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-white/65">
              Official poster: ₹1L returns {FLEET_INVESTMENT_STARTER.totalLabel} · ₹5L / ₹10L plans · then
              apply on Invest.
            </p>
          </div>
          <Link
            href={INVEST}
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#EC2A8C] px-7 font-bold text-white shadow-[0_12px_28px_rgba(236,42,140,0.28)] transition hover:bg-[#d01878] sm:w-auto"
          >
            Open Invest
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
