import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const plans = [
  {
    name: "Hourly",
    price: inr(CATALOG_RATES.Hourly),
    unit: "/ hour",
    note: "+ 5% GST",
    featured: false,
    href: "/ride-options",
  },
  {
    name: "Daily",
    price: inr(CATALOG_RATES.Daily),
    unit: "/ day",
    note: "Most booked · + 5% GST",
    featured: true,
    href: "/ride-options",
  },
  {
    name: "Weekly",
    price: inr(CATALOG_RATES.Weekly),
    unit: "/ week",
    note: "+ 5% GST",
    featured: false,
    href: "/ride-options",
  },
  {
    name: "Monthly",
    price: inr(CATALOG_RATES.Monthly),
    unit: "/ month",
    note: "+ 5% GST",
    featured: false,
    href: "/ride-options",
  },
];

export default function HomePlans() {
  return (
    <section id="plans" className="bg-[#F4F7F5] py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="ev-kicker">India-ready pricing</p>
            <h2 className="ev-display mt-4 text-4xl text-[#0F172A] sm:text-6xl">
              Clear fares.
              <span className="italic text-[#18B368]"> No hidden extras.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500">
              Same catalog as Book EV. GST 5% on rent only. Normal rentals add a refundable
              deposit (usually ₹2,500). A scooter can override the list price.
            </p>
          </div>
          <Link href="/ride-options" className="ev-cta w-fit">
            Book at your hub
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-16 grid border-t border-[#0F172A]/10 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href={plan.href}
              className={`group border-b border-[#0F172A]/10 px-1 py-8 xl:border-b-0 xl:px-8 first:xl:pl-0 last:xl:pr-0 ${
                plan.featured ? "xl:border-x xl:border-[#18B368]/40" : ""
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#18B368]">
                {plan.name}
                {plan.featured ? " · most booked" : ""}
              </p>
              <p className="ev-display mt-4 text-5xl text-[#0F172A]">
                {plan.price}
                <span className="ml-1 text-lg not-italic text-slate-400">{plan.unit}</span>
              </p>
              <p className="mt-3 text-sm text-slate-500">{plan.note}</p>
              <span className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-[#18B368]">
                Choose plan
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/ride-options"
          className="mt-10 flex flex-col items-start justify-between gap-6 border-y border-[#0F172A]/10 py-10 sm:flex-row sm:items-center"
        >
          <div>
            <p className="ev-kicker">Rent to Own</p>
            <p className="ev-display mt-3 text-4xl text-[#0F172A] sm:text-5xl">
              {inr(RTO_PLAN.dailyRate)}
              <span className="text-xl text-slate-400"> / day</span>
              <span className="italic text-[#18B368]"> · {RTO_PLAN.tenureMonths} months</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              No security deposit. Daily receipt. Ownership after a successful term.
            </p>
          </div>
          <span className="ev-cta">
            Start Rent to Own
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
