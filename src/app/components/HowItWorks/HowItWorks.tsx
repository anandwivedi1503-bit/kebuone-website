"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, MapPinned, Smartphone, Wallet } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";
import { BRAND } from "@/lib/brandMedia";

export default function HowItWorks() {
  const { catalog } = useHomeCatalog();
  const cityLine =
    catalog.cities.length > 0
      ? catalog.cities.map((city) => city.cityName).join(" · ")
      : "शहर · हब · स्कूटर";
  const hubLine =
    catalog.hubCount > 0
      ? `${catalog.hubCount} live hub${catalog.hubCount === 1 ? "" : "s"}`
      : "Pick a live hub on Book EV";

  const steps = [
    {
      n: "01",
      title: "Register once",
      hi: "फोन OTP + KYC",
      text: "Sign up with your mobile. Finish KYC. Staff enable booking — Eva cannot approve.",
      icon: Smartphone,
      image: BRAND.register,
    },
    {
      n: "02",
      title: "Pick hub & plan",
      hi: cityLine,
      text: `${hubLine}. Choose city, hub and hourly, daily, weekly, monthly — or Rent to Own.`,
      icon: MapPinned,
      image: BRAND.city,
    },
    {
      n: "03",
      title: "Pay on Book EV",
      hi: "Razorpay / वॉलेट",
      text: "Pay rent + 5% GST and deposit where it applies. First ₹1 issues pickup OTP.",
      icon: Wallet,
      image: BRAND.pay,
    },
    {
      n: "04",
      title: "Ride with OTP",
      hi: "यार्ड पर दिखाएँ",
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

        <div className="mt-16 grid gap-10 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="overflow-hidden border-t border-[#E4DDD2] pt-6">
                <div className="mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden bg-[#EDE8DE] p-3">
                  <img src={step.image} alt={step.title} className="max-h-full max-w-full object-contain object-center" />
                </div>
                <p className="text-[11px] tracking-[0.2em] text-[#8A847A]">{step.n}</p>
                <Icon size={18} strokeWidth={1.5} className="mt-5 text-[#1F6B4A]" />
                <h3 className="font-display mt-4 text-2xl font-medium text-[#1C1917]">{step.title}</h3>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#1F6B4A]">
                  {step.hi}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#5C635E]">{step.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 grid sm:grid-cols-[0.4fr_0.6fr]">
          <img
            src={BRAND.yard}
            alt="EVUDDY scooter"
            className="h-56 w-full bg-[#EDE8DE] object-contain object-center sm:h-full"
          />
          <div className="flex flex-col justify-center gap-6 bg-[#FBF9F5] px-6 py-10 sm:px-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5F6B63]">
                Ready to get started?
              </p>
              <h3 className="font-display mt-3 text-3xl font-medium text-[#1C1917] sm:text-4xl">
                Experience smarter urban mobility
              </h3>
            </div>
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 bg-[#1F6B4A] px-8 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white sm:w-auto">
                Book an EV
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
