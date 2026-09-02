import Link from "next/link";

import { FLEET_INVESTMENT, FLEET_INVESTMENT_STARTER } from "@/lib/fleetInvestment";

const INVEST = FLEET_INVESTMENT.pageHref;

export default function InvestHomeInvite() {
  return (
    <section className="bg-[#F6F4EF] py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-[2px] border border-[#0A1134]/10 bg-white lg:grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#18B368]">
              Fleet Partner Investment
            </p>
            <h3 className="mt-4 max-w-xl text-[1.85rem] font-medium tracking-[-0.04em] text-[#0A1134] sm:text-[2.35rem]">
              From ₹1 lakh. You earn {FLEET_INVESTMENT.investorSharePercent}%.{" "}
              {FLEET_INVESTMENT.tenureMonths} months.
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Official poster: ₹1L returns {FLEET_INVESTMENT_STARTER.totalLabel} · ₹5L / ₹10L
              plans · {FLEET_INVESTMENT.company}. Same numbers as Invest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={INVEST}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#18B368] px-7 text-sm font-semibold text-white transition hover:bg-[#149a58]"
              >
                Open Invest
              </Link>
              <Link
                href="/partners#partner-form"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#0A1134]/15 px-7 text-sm font-medium text-[#0A1134] transition hover:border-[#0A1134]"
              >
                Partner form
              </Link>
            </div>
          </div>
          <Link
            href={INVEST}
            className="relative flex items-center justify-center bg-[#0A1134] px-8 py-10"
          >
            <img
              src={FLEET_INVESTMENT.posterSrc}
              alt="EVUDDY Fleet Partner Investment poster"
              width={320}
              height={480}
              className="h-auto w-full max-w-[220px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:max-w-[260px]"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
