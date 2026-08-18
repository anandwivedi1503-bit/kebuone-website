"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Leaf, MapPinned, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted partners",
    text: "Verified operations focused on safety, reliability and quality.",
  },
  {
    icon: MapPinned,
    title: "Smart tracking",
    text: "Live updates from booking until your ride is complete.",
  },
  {
    icon: Leaf,
    title: "Electric first",
    text: "Cleaner city travel with sustainability at the core.",
  },
  {
    icon: HeartHandshake,
    title: "Customer first",
    text: "Clear pricing, responsive support and a simple booking flow.",
  },
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="relative overflow-hidden bg-[#F6FAF8] py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#18B368]/10 blur-[110px]" />
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#18B368]" />
            WHY CHOOSE EVUDDY
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Built for the future of{" "}
            <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              smart mobility
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            Technology, sustainability and a customer-first ride experience for modern Indian cities.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18B368] to-[#12A857] text-white">
              <Leaf size={28} />
            </div>
            <h3 className="mt-6 text-3xl font-black leading-tight text-[#0F172A] sm:text-4xl">
              Sustainable by design
            </h3>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
              An electric-first ecosystem for smarter transport, cleaner cities and a better everyday commute.
            </p>
            <span className="mt-6 inline-flex rounded-full bg-[#18B368]/10 px-4 py-2 text-sm font-semibold text-[#18B368]">
              Future-ready platform
            </span>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-white bg-white p-5 shadow-sm sm:p-6"
                >
                  <Icon className="text-[#18B368]" size={28} />
                  <h4 className="mt-4 text-lg font-bold text-[#0F172A]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white bg-white px-5 py-8 text-center shadow-sm sm:px-10 sm:py-12">
          <h3 className="text-2xl font-black text-[#0F172A] sm:text-4xl">Ready to ride smarter?</h3>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Register once, then book an EVUDDY scooter from your nearest hub.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 py-4 font-bold text-white sm:w-auto">
                Book an EV
                <ArrowRight size={18} />
              </span>
            </Link>
            <Link href="/book-bike" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-8 py-4 font-bold text-[#0F172A] sm:w-auto">
                I already have an account
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}