"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
    hi: "शहर · हब · स्कूटर",
    text: "Choose city, hub and hourly, daily, weekly, monthly — or Rent to Own.",
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

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="ev-kicker">How it works</p>
          <h2 className="ev-display mt-4 text-4xl text-[#0F172A] sm:text-6xl">
            Four steps. <span className="italic text-[#18B368]">Phone-first.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-slate-500">
            Same flow millions of Indian riders expect — KYC, hub pickup, OTP, live GPS.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-[#0F172A]/10 xl:block" />
          {steps.map((step) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="ev-display text-6xl text-[#18B368]/25">{step.n}</p>
              <h3 className="mt-4 text-xl font-semibold text-[#0F172A]">{step.title}</h3>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#18B368]">
                {step.hi}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{step.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[#0F172A]/10 pt-10 sm:flex-row sm:items-center">
          <div>
            <p className="ev-kicker">Ready to get started?</p>
            <h3 className="ev-display mt-2 text-3xl text-[#0F172A] sm:text-4xl">
              Experience smarter urban mobility
            </h3>
          </div>
          <Link href="/ride-options" className="ev-cta w-full sm:w-auto">
            Book an EV
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
