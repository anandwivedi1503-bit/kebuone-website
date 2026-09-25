"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, MapPinned, Smartphone, Wallet } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";
import { BRAND } from "@/lib/brandMedia";
import HomeImg from "../HomeMedia/HomeImg";

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
      icon: Smartphone,
      image: BRAND.register,
    },
    {
      n: "02",
      title: "Pick hub & plan",
      hi: cityLine,
      text: `${hubLine}. Choose hourly, daily, weekly, monthly — or Rent to Own.`,
      icon: MapPinned,
      image: BRAND.afterWork,
    },
    {
      n: "03",
      title: "Pay on Book EV",
      hi: "Razorpay / wallet",
      text: "Pay the GST-included fare. First ₹1 issues pickup OTP.",
      icon: Wallet,
      image: BRAND.pay,
    },
    {
      n: "04",
      title: "Ride with OTP",
      hi: "Show at the yard",
      text: "Show pickup OTP at the hub. They unlock. Swipe Ride started. Return when remaining is ₹0.",
      icon: KeyRound,
      image: BRAND.yard,
    },
  ];

  return (
    <section id="how-it-works" className="relative scroll-mt-28 bg-[#F7F4EE] py-20 sm:scroll-mt-40 sm:py-28">
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

        <div className="mt-14 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const reverse = index % 2 === 1;
            return (
              <article
                key={step.n}
                className={`grid overflow-hidden bg-[#FBF9F5] lg:grid-cols-2 ${
                  reverse ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="relative min-h-[200px] bg-[#1C1917] sm:min-h-[240px]">
                  <HomeImg
                    src={step.image}
                    alt={step.title}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
                  <p className="font-display text-4xl font-medium text-[#1F6B4A]">{step.n}</p>
                  <Icon size={18} strokeWidth={1.5} className="mt-5 text-[#1F6B4A]" />
                  <h3 className="font-display mt-3 text-2xl font-medium text-[#1C1917] sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#1F6B4A]">
                    {step.hi}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-[#5C635E]">{step.text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <Link href="/ride-options" className="mt-8 inline-flex">
          <span className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#1F6B4A] px-8 text-[13px] font-medium tracking-[0.08em] text-white">
            Book an EV
            <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
