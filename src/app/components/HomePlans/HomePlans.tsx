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
    { name: "Hourly", price: inr(rates.hourly), unit: "/hr", note: "GST included", emoji: "⚡", featured: false },
    { name: "Daily", price: inr(rates.daily), unit: "/day", note: "Most booked", emoji: "🛵", featured: true },
    { name: "Weekly", price: inr(rates.weekly), unit: "/wk", note: "GST included", emoji: "📅", featured: false },
    { name: "Monthly", price: inr(rates.monthly), unit: "/mo", note: "GST included", emoji: "🏡", featured: false },
  ];

  return (
    <section id="plans" className="relative scroll-mt-28 bg-[#F7F4EE] py-16 sm:scroll-mt-40 sm:py-24">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">Plans</p>
            <h2 className="font-display mt-3 text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
              GST included. <span className="italic text-[#1F6B4A]">No extras.</span>
            </h2>
          </div>
          <Link href="/ride-options" className="text-[13px] font-medium text-[#1F6B4A]">
            Book at your hub →
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href="/ride-options"
              className={`overflow-hidden rounded-[24px] transition ${
                plan.featured ? "bg-[#E7F6EC] ring-1 ring-[#1F6B4A]/20" : "bg-white ring-1 ring-[#E6EBE7]"
              }`}
            >
              <div className="relative h-28 overflow-hidden">
                <HomeImg src={BRAND.cityCommute} alt="" className="h-full w-full object-cover object-center" />
                <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                  {plan.emoji}
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                  {plan.name}
                  {plan.featured ? " · most booked" : ""}
                </p>
                <p className="font-display mt-2 text-[1.85rem] font-medium tracking-tight text-[#1C1917]">
                  {plan.price}
                  <span className="ml-1 text-sm font-sans font-normal text-[#8A847A]">{plan.unit}</span>
                </p>
                <p className="mt-1 text-xs text-[#5C635E]">{plan.note}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/ride-options"
          className="mt-4 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-[24px] bg-[#0B1B16] sm:flex-row sm:items-center"
        >
          <div className="relative hidden h-28 w-44 shrink-0 sm:block">
            <HomeImg src={BRAND.cityCommute} alt="" className="h-full w-full object-cover object-center" />
          </div>
          <div className="px-5 py-5 sm:px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              🔑 Rent to Own · {rates.rtoMonths} months
            </p>
            <p className="font-display mt-1 text-2xl font-medium text-white">
              {inr(rates.rtoDaily)}
              <span className="text-base font-sans font-normal text-white/60"> / day</span>
            </p>
            <p className="mt-1 text-xs text-white/65">GST included · ₹2,500 refundable deposit</p>
          </div>
          <span className="mb-5 ml-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#0B1B16] sm:mb-0 sm:mr-5 sm:ml-0">
            Start
            <ArrowRight size={14} />
          </span>
        </Link>
      </div>
    </section>
  );
}
