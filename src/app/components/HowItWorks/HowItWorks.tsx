"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

export default function HowItWorks() {
  const { catalog } = useHomeCatalog();
  const cityLine =
    catalog.cities.length > 0
      ? catalog.cities.map((city) => city.cityName).join(" · ")
      : "City · hub · scooter";
  const hubLine =
    catalog.hubCount > 0
      ? `${catalog.hubCount} live hub${catalog.hubCount === 1 ? "" : "s"}`
      : "Pick a live hub on Book EV";

  const steps = [
    {
      n: "01",
      title: "Register once",
      hi: "Phone OTP + KYC",
      text: "Sign up with your mobile. Finish KYC. Staff enable booking — Eva cannot approve.",
    },
    {
      n: "02",
      title: "Pick hub & plan",
      hi: cityLine,
      text: `${hubLine}. Choose hourly, daily, weekly, monthly — or Rent to Own.`,
    },
    {
      n: "03",
      title: "Pay on Book EV",
      hi: "Razorpay / wallet",
      text: "Pay the GST-included fare. First ₹1 issues pickup OTP.",
    },
    {
      n: "04",
      title: "Ride with OTP",
      hi: "Show at the yard",
      text: "Show OTP. They unlock. Swipe Ride started. Return when remaining is ₹0.",
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-28 bg-[#FBF9F5] py-16 sm:scroll-mt-40 sm:py-24">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            How it works
          </span>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Four steps. <span className="italic text-[#1F6B4A]">Phone-first.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-[#5C635E]">
            Same flow — KYC, hub pickup, OTP, live GPS
            {catalog.cities.length
              ? ` — in ${catalog.cities.map((city) => city.cityName).join(", ")}.`
              : "."}
          </p>
        </div>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.n}
              className="relative border-t border-[#E4DDD2] px-0 py-8 sm:px-6 sm:first:pl-0 xl:border-t-0 xl:border-l xl:first:border-l-0 xl:first:pl-0"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-medium text-[#1F6B4A]">{step.n}</span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-px flex-1 bg-[#E4DDD2] xl:block" aria-hidden />
                ) : null}
              </div>
              <h3 className="font-display mt-5 text-2xl font-medium text-[#1C1917]">{step.title}</h3>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#1F6B4A]">
                {step.hi}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5C635E]">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-[#0B1B16] px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8">
          <p className="font-display text-2xl font-medium">Ready when you are.</p>
          <Link
            href="/ride-options"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[13px] font-semibold text-[#0B1B16]"
          >
            Book an EV
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
