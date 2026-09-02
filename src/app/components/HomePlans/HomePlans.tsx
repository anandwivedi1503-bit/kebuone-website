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
    <section id="plans" className="relative overflow-hidden bg-[#F4F8F6] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18B368]/40 to-transparent" />
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
              India-ready pricing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl">
              Clear fares.{" "}
              <span className="text-[#18B368]">No hidden extras.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
              Same catalog as Book EV. GST 5% on rent only. Normal rentals add a refundable
              deposit (usually ₹2,500). A scooter can override the list price.
            </p>
          </div>
          <Link
            href="/ride-options"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#18B368] px-6 text-sm font-bold text-white shadow-[0_14px_32px_rgba(24,179,104,0.28)]"
          >
            Book at your hub
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href={plan.href}
              className={`group relative overflow-hidden rounded-[28px] border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 ${
                plan.featured
                  ? "border-[#18B368] bg-[#0B1B16] text-white"
                  : "border-white bg-white text-[#0F172A]"
              }`}
            >
              {plan.featured ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#18B368] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                  Most booked
                </span>
              ) : null}
              <p
                className={`text-xs font-bold uppercase tracking-[0.16em] ${
                  plan.featured ? "text-[#6EE7A8]" : "text-slate-400"
                }`}
              >
                {plan.name}
              </p>
              <p className="mt-4 text-4xl font-black tracking-tight">
                {plan.price}
                <span
                  className={`ml-1 text-base font-semibold ${
                    plan.featured ? "text-white/50" : "text-slate-400"
                  }`}
                >
                  {plan.unit}
                </span>
              </p>
              <p
                className={`mt-2 text-sm ${
                  plan.featured ? "text-white/70" : "text-slate-500"
                }`}
              >
                {plan.note}
              </p>
              <span
                className={`mt-6 inline-flex items-center gap-1 text-sm font-bold ${
                  plan.featured ? "text-[#6EE7A8]" : "text-[#18B368]"
                }`}
              >
                Choose plan
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/ride-options"
          className="mt-4 flex flex-col items-start justify-between gap-4 rounded-[28px] border border-[#18B368]/25 bg-[#0B1B16] p-6 text-white sm:flex-row sm:items-center sm:p-8"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6EE7A8]">
              Rent to Own
            </p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">
              {inr(RTO_PLAN.dailyRate)}
              <span className="text-lg font-semibold text-white/50"> / day</span>
              {" · "}
              {RTO_PLAN.tenureMonths} months
            </p>
            <p className="mt-1 text-sm text-white/65">
              No security deposit. Daily receipt. Ownership after a successful term.
            </p>
          </div>
          <span className="inline-flex h-12 items-center gap-2 rounded-full bg-[#18B368] px-6 text-sm font-bold text-white">
            Start Rent to Own
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
