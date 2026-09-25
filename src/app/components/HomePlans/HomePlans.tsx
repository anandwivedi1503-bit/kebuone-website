"use client";

import Link from "next/link";
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
    { name: "Hourly", price: inr(rates.hourly), unit: "/hr", note: "GST included", featured: false },
    { name: "Daily", price: inr(rates.daily), unit: "/day", note: "Most booked", featured: true },
    { name: "Weekly", price: inr(rates.weekly), unit: "/wk", note: "GST included", featured: false },
    { name: "Monthly", price: inr(rates.monthly), unit: "/mo", note: "GST included", featured: false },
  ];

  return (
    <section id="plans" className="scroll-mt-28 bg-[#F7F4EE] py-8 sm:scroll-mt-40 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">Plans</p>
            <h2 className="font-display mt-2 text-3xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-4xl">
              GST included. <span className="italic text-[#1F6B4A]">No extras.</span>
            </h2>
          </div>
          <Link href="/ride-options" className="hidden text-[13px] font-medium text-[#1F6B4A] sm:inline">
            Book at your hub →
          </Link>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {plans.map((plan) => (
            <Link
              key={plan.name}
              href="/ride-options"
              className={`min-w-[176px] flex-1 overflow-hidden rounded-[24px] transition sm:min-w-0 ${
                plan.featured
                  ? "bg-[#E7F6EC] ring-1 ring-[#1F6B4A]/15"
                  : "bg-white ring-1 ring-[#E6EBE7]"
              }`}
            >
              <div className="relative h-20 overflow-hidden">
                <HomeImg
                  src={BRAND.cityCommute}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B736E]">
                  {plan.name}
                </p>
                <p className="font-display mt-2 text-[1.75rem] font-medium tracking-tight text-[#1C1917]">
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
          className="mt-4 flex items-center justify-between rounded-[24px] bg-[#0B1B16] px-5 py-5 text-white"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Rent to Own</p>
            <p className="font-display mt-1 text-2xl font-medium">
              {inr(rates.rtoDaily)}
              <span className="text-base font-sans font-normal text-white/60"> / day · {rates.rtoMonths} months</span>
            </p>
            <p className="mt-1 text-xs text-white/65">GST included · ₹2,500 refundable deposit</p>
          </div>
          <span className="hidden rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#0B1B16] sm:inline">
            Start →
          </span>
        </Link>
      </div>
    </section>
  );
}
