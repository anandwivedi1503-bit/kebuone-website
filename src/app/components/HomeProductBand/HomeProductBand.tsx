import Link from "next/link";

import { FLEET_INVESTMENT } from "@/lib/fleetInvestment";
import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

const tiles = [
  {
    kicker: "Ride",
    title: "Daily rental",
    price: `₹${CATALOG_RATES.Hourly}`,
    unit: "/ hour",
    detail: `Daily ₹${CATALOG_RATES.Daily} · Weekly ₹${CATALOG_RATES.Weekly.toLocaleString("en-IN")} · Monthly ₹${CATALOG_RATES.Monthly.toLocaleString("en-IN")} · + GST · refundable deposit.`,
    href: "/ride-options",
    cta: "Book",
    image: "/evuddy-scooter-cutout.png",
    imageAlt: "EVUDDY electric scooter",
    tone: "light" as const,
  },
  {
    kicker: "Own",
    title: "Rent to Own",
    price: `₹${RTO_PLAN.dailyRate}`,
    unit: "/ day",
    detail: `${RTO_PLAN.tenureMonths} months · + 5% GST · no security deposit · ownership after the term.`,
    href: "/rent-to-own",
    cta: "Start RTO",
    image: "/trans.png",
    imageAlt: "EVUDDY scooter for Rent to Own",
    tone: "light" as const,
  },
  {
    kicker: "Capital",
    title: "Fleet partners",
    price: "₹1L",
    unit: `start · ${FLEET_INVESTMENT.investorSharePercent}% share`,
    detail: `${FLEET_INVESTMENT.tenureMonths} months · ${FLEET_INVESTMENT.company}. Official poster on Invest.`,
    href: FLEET_INVESTMENT.pageHref,
    cta: "Invest",
    image: FLEET_INVESTMENT.posterSrc,
    imageAlt: "EVUDDY fleet partner investment poster",
    tone: "navy" as const,
  },
];

export default function HomeProductBand() {
  return (
    <section aria-label="EVUDDY products" className="bg-[#F4F1EA]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#18B368]">
            Three ways to ride with EVUDDY
          </p>
          <h2 className="mt-3 text-[2rem] font-medium tracking-[-0.045em] text-[#0A1134] sm:text-[2.75rem]">
            Rent. Own. Invest.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            Same hub network. Clear pricing. Built for riders and fleet capital.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 lg:grid-cols-3 lg:gap-5">
          {tiles.map((tile) => {
            const navy = tile.tone === "navy";
            return (
              <Link
                key={tile.title}
                href={tile.href}
                className={`group flex flex-col overflow-hidden rounded-[28px] border transition ${
                  navy
                    ? "border-[#0A1134] bg-[#0A1134] text-white shadow-[0_24px_60px_rgba(10,17,52,0.28)]"
                    : "border-[#0A1134]/8 bg-white text-[#0A1134] shadow-[0_18px_40px_rgba(15,23,42,0.06)] hover:border-[#18B368]/35"
                }`}
              >
                <div
                  className={`relative flex h-48 items-center justify-center overflow-hidden sm:h-56 ${
                    navy
                      ? "bg-gradient-to-b from-[#121a3d] to-[#0A1134]"
                      : "bg-gradient-to-b from-[#F7FBF8] to-white"
                  }`}
                >
                  <img
                    src={tile.image}
                    alt={tile.imageAlt}
                    className={`relative z-[1] h-auto object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.18)] ${
                      navy ? "max-h-44 w-[58%] rounded-xl" : "max-h-40 w-[78%] sm:max-h-48"
                    }`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-x-8 bottom-4 h-8 rounded-[100%] blur-xl ${
                      navy ? "bg-[#18B368]/25" : "bg-[#0A1134]/10"
                    }`}
                  />
                </div>

                <div className="flex flex-1 flex-col px-6 pb-7 pt-5 sm:px-7">
                  <p
                    className={`text-[11px] font-medium uppercase tracking-[0.2em] ${
                      navy ? "text-[#18B368]" : "text-slate-400"
                    }`}
                  >
                    {tile.kicker}
                  </p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em]">{tile.title}</h3>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-medium tracking-[-0.04em]">{tile.price}</span>
                    <span className={`text-sm ${navy ? "text-white/55" : "text-slate-500"}`}>
                      {tile.unit}
                    </span>
                  </p>
                  <p className={`mt-3 flex-1 text-sm leading-6 ${navy ? "text-white/55" : "text-slate-500"}`}>
                    {tile.detail}
                  </p>
                  <span
                    className={`mt-7 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                      navy
                        ? "bg-[#18B368] text-white group-hover:bg-[#14a35e]"
                        : "bg-[#0A1134] text-white group-hover:bg-[#18B368]"
                    }`}
                  >
                    {tile.cta}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
