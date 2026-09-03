"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function HomePlans() {
  const { catalog } = useHomeCatalog();
  const { rates } = catalog;

  const plans = [
    { name: "Hourly", price: inr(rates.hourly), unit: "/ hour", note: "+ 5% GST", featured: false },
    { name: "Daily", price: inr(rates.daily), unit: "/ day", note: "Most booked · + 5% GST", featured: true },
    { name: "Weekly", price: inr(rates.weekly), unit: "/ week", note: "+ 5% GST", featured: false },
    { name: "Monthly", price: inr(rates.monthly), unit: "/ month", note: "+ 5% GST", featured: false },
  ];

  return (
    <section id="plans" className="relative bg-[#FBF9F5] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
              India-ready pricing
            </p>
            <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
              Clear fares. <span className="italic text-[#1F6B4A]">No hidden extras.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
              Starting fares from live EVUDDY scooters — same catalog as Book EV. GST 5% on rent only.
              A scooter can override the list price at its hub.
            </p>
          </div>
          <Link
            href="/ride-options"
            className="inline-flex h-12 items-center gap-2 bg-[#1F6B4A] px-6 text-[13px] font-medium tracking-[0.08em] text-white hover:bg-[#18573c]"
          >
            Book at your hub
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid border-t border-[#E4DDD2] sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href="/ride-options"
              className={`group border-b border-[#E4DDD2] px-1 py-8 xl:border-b-0 xl:px-8 first:xl:pl-0 last:xl:pr-0 ${
                plan.featured ? "xl:border-x xl:border-[#E4DDD2]" : ""
              }`}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">
                {plan.name}
                {plan.featured ? " · most booked" : ""}
              </p>
              <p className="font-display mt-4 text-4xl font-medium tracking-tight text-[#1C1917]">
                {plan.price}
                <span className="ml-1 text-base font-normal text-[#8A847A]">{plan.unit}</span>
              </p>
              <p className="mt-2 text-sm text-[#5C635E]">{plan.note}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-[13px] font-medium text-[#1F6B4A]">
                Choose plan
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/ride-options"
          className="mt-2 flex flex-col items-start justify-between gap-4 border-y border-[#E4DDD2] py-10 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">Rent to Own</p>
            <p className="font-display mt-2 text-3xl font-medium text-[#1C1917]">
              {inr(rates.rtoDaily)}
              <span className="text-lg font-normal text-[#8A847A]"> / day</span>
              {" · "}
              {rates.rtoMonths} months
            </p>
            <p className="mt-1 text-sm text-[#5C635E]">
              No security deposit. Daily receipt. Ownership after a successful term.
            </p>
          </div>
          <span className="inline-flex h-12 items-center gap-2 bg-[#1F6B4A] px-6 text-[13px] font-medium tracking-[0.08em] text-white">
            Start Rent to Own
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
