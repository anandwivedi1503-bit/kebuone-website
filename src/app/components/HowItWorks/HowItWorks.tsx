"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  LayoutGrid,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    n: "01",
    icon: LayoutGrid,
    title: "Register once",
    hi: "फोन OTP + KYC",
    text: "Sign up with your mobile. Finish KYC. Staff enable booking — Eva cannot approve.",
  },
  {
    n: "02",
    icon: CalendarCheck,
    title: "Pick hub & plan",
    hi: "शहर · हब · स्कूटर",
    text: "Choose city, hub and hourly, daily, weekly, monthly — or Rent to Own.",
  },
  {
    n: "03",
    icon: MapPinned,
    title: "Pay on Book EV",
    hi: "Razorpay / वॉलेट",
    text: "Pay rent + 5% GST and deposit where it applies. First ₹1 issues pickup OTP.",
  },
  {
    n: "04",
    icon: ShieldCheck,
    title: "Ride with OTP",
    hi: "यार्ड पर दिखाएँ",
    text: "Show pickup OTP at the hub. They unlock. Swipe Ride started. Return when remaining is ₹0.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#18B368]" />
            HOW IT WORKS
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Four steps.{" "}
            <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              Phone-first.
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            Same flow millions of Indian riders expect — KYC, hub pickup, OTP, live GPS.
          </p>
        </div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden h-px bg-gradient-to-r from-[#18B368]/0 via-[#18B368]/40 to-[#18B368]/0 xl:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#18B368]/30 sm:p-7"
              >
                <span className="absolute right-4 top-3 text-5xl font-black text-[#18B368]/10">
                  {step.n}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18B368] text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#0F172A]">{step.title}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#18B368]">
                  {step.hi}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[#0B1B16] px-5 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6EE7A8]">
              Ready to get started?
            </p>
            <h3 className="mt-2 text-2xl font-black sm:text-4xl">Experience smarter urban mobility</h3>
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
