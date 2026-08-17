"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Smartphone, Users, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Higher earnings",
    text: "New revenue through a growing EV rental ecosystem.",
  },
  {
    icon: Smartphone,
    title: "Smart operations",
    text: "Manage bookings, hubs and growth from one platform.",
  },
  {
    icon: Briefcase,
    title: "Business growth",
    text: "Expand with a mobility brand built for Indian cities.",
  },
  {
    icon: Users,
    title: "Strong community",
    text: "Work with partners who share a cleaner mobility vision.",
  },
];

export default function PartnerSection() {
  return (
    <section id="partner" className="relative overflow-hidden bg-[#F6FAF8] py-16 sm:py-24">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#18B368]" />
            PARTNER WITH EVUDDY
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Grow together.{" "}
            <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              Build the future.
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            Join as a franchise, fleet or hub partner in a technology-led electric mobility network.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-[28px] border border-white bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex rounded-full bg-[#18B368]/10 px-3 py-1.5 text-xs font-bold text-[#18B368]">
                WHY PARTNER WITH US
              </span>
              <h3 className="mt-4 text-3xl font-black leading-tight text-[#0F172A] sm:text-4xl">
                Build your business with EVUDDY.
              </h3>
              <p className="mt-4 max-w-xl text-slate-500">
                Fleet owners, operators and entrepreneurs get the technology and support to scale with confidence.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-[#F7FBF8] p-4">
                    <Icon className="text-[#18B368]" size={26} />
                    <h4 className="mt-3 font-bold text-[#0F172A]">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#18B368]/8 p-5 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-xl font-bold text-[#0F172A]">Ready to grow with EVUDDY?</h4>
              <p className="mt-1 text-sm text-slate-500">Join the partner network for the next wave of urban EV mobility.</p>
            </div>
            <Link href="/partners" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-7 py-4 font-bold text-white sm:w-auto">
                Become a Partner
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
