"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, MapPinned, Smartphone, Wallet } from "lucide-react";
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
      icon: Smartphone,
    },
    {
      n: "02",
      title: "Pick hub & plan",
      hi: cityLine,
      text: `${hubLine}. Choose city, hub and hourly, daily, weekly, monthly — or Rent to Own.`,
      icon: MapPinned,
    },
    {
      n: "03",
      title: "Pay on Book EV",
      hi: "Razorpay / वॉलेट",
      text: "Pay rent + 5% GST and deposit where it applies. First ₹1 issues pickup OTP.",
      icon: Wallet,
    },
    {
      n: "04",
      title: "Ride with OTP",
      hi: "यार्ड पर दिखाएँ",
      text: "Show pickup OTP at the hub. They unlock. Swipe Ride started. Return when remaining is ₹0.",
      icon: KeyRound,
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-[#F7FBFA] py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#18B368]/10 blur-[110px]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[#EC2A8C]/10 blur-[100px]" />
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
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

        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-[34px] hidden h-px bg-gradient-to-r from-[#18B368] via-[#F5C400] to-[#EC2A8C] xl:block" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-[28px] border border-[#E8EEEB] bg-white p-6 pt-8 shadow-[0_22px_50px_rgba(15,23,42,0.06)]"
                >
                  <span className="absolute left-6 top-0 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#F7FBFA] bg-[#18B368] text-xs font-black text-white">
                    {step.n.replace(/^0/, "")}
                  </span>
                  <span className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18B368]/10 text-[#18B368]">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#18B368]">
                    {step.hi}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:flex sm:items-center">
          <img
            src="/new-vehicle.jpeg"
            alt="EVUDDY scooter"
            className="h-48 w-full object-cover sm:h-44 sm:w-64 lg:h-52 lg:w-80"
          />
          <div className="flex flex-1 flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
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
      </div>
    </section>
  );
}
