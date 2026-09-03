"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

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
    },
    {
      n: "02",
      title: "Pick hub & plan",
      hi: cityLine,
      text: `${hubLine}. Choose city, hub and hourly, daily, weekly, monthly — or Rent to Own.`,
    },
    {
      n: "03",
      title: "Pay on Book EV",
      hi: "Razorpay / वॉलेट",
      text: "Pay rent + 5% GST and deposit where it applies. First ₹1 issues pickup OTP.",
    },
    {
      n: "04",
      title: "Ride with OTP",
      hi: "यार्ड पर दिखाएँ",
      text: "Show pickup OTP at the hub. They unlock. Swipe Ride started. Return when remaining is ₹0.",
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Four steps. <span className="text-[#18B368]">Phone-first.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            Same flow — KYC, hub pickup, OTP, live GPS
            {catalog.cities.length
              ? ` — in ${catalog.cities.map((city) => city.cityName).join(", ")}.`
              : "."}
          </p>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-px bg-[#18B368]/25 xl:block" />
          {steps.map((step) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-5xl font-black leading-none text-[#18B368]/20">{step.n}</p>
              <h3 className="mt-4 text-xl font-bold text-[#0F172A]">{step.title}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#18B368]">
                {step.hi}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-[#0F172A]/10 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
              Ready to get started?
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#0F172A] sm:text-4xl">
              Experience smarter urban mobility
            </h3>
          </div>
          <Link href="/ride-options" className="w-full sm:w-auto">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 py-4 font-bold text-white sm:w-auto">
              Book an EV
              <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
