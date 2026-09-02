import Link from "next/link";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

const tiles = [
  {
    kicker: "Ride",
    title: "Daily rental",
    price: `From ₹${CATALOG_RATES.Hourly}/hr`,
    detail: `Hourly ₹${CATALOG_RATES.Hourly} · Daily ₹${CATALOG_RATES.Daily} · GST on rent · refundable deposit.`,
    href: "/ride-options",
    cta: "Reserve a scooter",
    tone: "light" as const,
  },
  {
    kicker: "Own",
    title: "Rent to Own",
    price: `₹${RTO_PLAN.dailyRate}/day`,
    detail: `${RTO_PLAN.tenureMonths} months · + 5% GST · no security deposit · ownership after the term.`,
    href: "/rent-to-own",
    cta: "See Rent to Own",
    tone: "light" as const,
  },
  {
    kicker: "Capital",
    title: "Fleet partners",
    price: `From ₹1 lakh · ${FLEET_INVESTMENT.investorSharePercent}% share`,
    detail: `${FLEET_INVESTMENT.tenureMonths} months · ${FLEET_INVESTMENT.company}. Official poster on Invest.`,
    href: FLEET_INVESTMENT.pageHref,
    cta: "Open Invest",
    tone: "navy" as const,
  },
];

export default function HomeProductBand() {
  return (
    <section
      aria-label="EVUDDY products"
      className="border-y border-[#0A1134]/8 bg-[#F6F4EF]"
    >
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-3">
        {tiles.map((tile, index) => {
          const navy = tile.tone === "navy";
          return (
            <Link
              key={tile.title}
              href={tile.href}
              className={`group flex min-h-[280px] flex-col justify-between px-6 py-10 sm:px-10 sm:py-12 ${
                navy ? "bg-[#0A1134] text-white" : "bg-transparent text-[#0A1134]"
              } ${index < 2 ? "border-b border-[#0A1134]/8 lg:border-b-0 lg:border-r" : ""}`}
            >
              <div>
                <p
                  className={`text-[11px] font-medium uppercase tracking-[0.22em] ${
                    navy ? "text-[#18B368]" : "text-slate-500"
                  }`}
                >
                  {tile.kicker}
                </p>
                <h2 className="mt-4 text-[1.75rem] font-medium tracking-[-0.04em] sm:text-[2rem]">
                  {tile.title}
                </h2>
                <p className={`mt-3 text-lg ${navy ? "text-white/80" : "text-slate-700"}`}>
                  {tile.price}
                </p>
                <p className={`mt-3 max-w-sm text-sm leading-6 ${navy ? "text-white/55" : "text-slate-500"}`}>
                  {tile.detail}
                </p>
              </div>
              <span
                className={`mt-8 inline-flex text-sm font-medium ${
                  navy ? "text-[#18B368]" : "text-[#0A1134]"
                }`}
              >
                {tile.cta}
                <span className="ml-2 transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
