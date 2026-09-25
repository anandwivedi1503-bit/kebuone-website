"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";
import { BRAND } from "@/lib/brandMedia";
import HomeImg from "../HomeMedia/HomeImg";

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
    {
      name: "Hourly",
      price: inr(rates.hourly),
      unit: "/ hour",
      note: "GST included",
      image: BRAND.cityCommute,
      featured: false,
    },
    {
      name: "Daily",
      price: inr(rates.daily),
      unit: "/ day",
      note: "Most booked",
      image: BRAND.afterWork,
      featured: true,
    },
    {
      name: "Weekly",
      price: inr(rates.weekly),
      unit: "/ week",
      note: "GST included",
      image: BRAND.highway,
      featured: false,
    },
    {
      name: "Monthly",
      price: inr(rates.monthly),
      unit: "/ month",
      note: "GST included",
      image: BRAND.houseParked,
      featured: false,
    },
  ];

  return (
    <section id="plans" className="relative scroll-mt-28 bg-[#FBF9F5] py-20 sm:scroll-mt-40 sm:py-28">
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
              Starting fares from live EVUDDY scooters — GST included. Refundable ₹2,500 deposit on
              rentals and Rent to Own.
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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href="/ride-options"
              className={`group overflow-hidden bg-white ring-1 transition hover:-translate-y-0.5 ${
                plan.featured ? "ring-[#1F6B4A]/30" : "ring-[#E4DDD2]"
              }`}
            >
              <div className="relative h-40 overflow-hidden bg-[#1C1917]">
                <HomeImg
                  src={plan.image}
                  alt={`${plan.name} EVUDDY ride`}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                />
                {plan.featured ? (
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1F6B4A]">
                    Most booked
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">{plan.name}</p>
                <p className="font-display mt-3 text-3xl font-medium tracking-tight text-[#1C1917]">
                  {plan.price}
                  <span className="ml-1 text-base font-normal text-[#8A847A]">{plan.unit}</span>
                </p>
                <p className="mt-1 text-sm text-[#5C635E]">{plan.note}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/ride-options"
          className="mt-4 grid overflow-hidden bg-[#0B1B16] text-white sm:grid-cols-[220px_1fr_auto] sm:items-center"
        >
          <div className="relative hidden h-full min-h-[140px] sm:block">
            <HomeImg src={BRAND.range} alt="Rent to Own EVUDDY scooter" className="h-full w-full object-cover" />
          </div>
          <div className="px-6 py-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              Rent to Own · {rates.rtoMonths} months
            </p>
            <p className="font-display mt-2 text-3xl font-medium">
              {inr(rates.rtoDaily)}
              <span className="text-lg font-normal text-white/55"> / day</span>
            </p>
            <p className="mt-1 text-sm text-white/65">GST included · ₹2,500 refundable deposit</p>
          </div>
          <span className="m-6 inline-flex h-12 items-center justify-center bg-white px-6 text-[13px] font-medium tracking-[0.08em] text-[#0B1B16]">
            Start Rent to Own
            <ArrowRight size={16} className="ml-2" />
          </span>
        </Link>
      </div>
    </section>
  );
}
