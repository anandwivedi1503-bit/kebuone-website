"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Smartphone, Users, Wallet } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";

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
    <section id="partner" className="relative scroll-mt-28 bg-[#F7F4EE] py-20 sm:scroll-mt-40 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Partner with EVUDDY
          </span>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            Fleet, hub, franchise.{" "}
            <span className="italic text-[#1F6B4A]">One EV network.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Join as a franchise, fleet or hub partner in a technology-led electric mobility network.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="mt-12 overflow-hidden">
            <img
              src={BRAND.franchise}
              alt="EVUDDY franchise showroom — partners shaking hands beside yellow scooters"
              className="aspect-[16/7] w-full object-cover object-center"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#5F6B63]">
                Why partner with us
              </span>
              <h3 className="font-display mt-4 text-3xl font-medium leading-tight text-[#1C1917]">
                Build your business with EVUDDY.
              </h3>
              <p className="mt-4 max-w-xl text-[#5C635E]">
                Fleet owners, operators and entrepreneurs get the technology and support to scale with confidence.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="border-t border-[#E4DDD2] pt-4">
                    <Icon className="text-[#1F6B4A]" size={18} strokeWidth={1.5} />
                    <h4 className="mt-3 font-medium text-[#1C1917]">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#5C635E]">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-[#E4DDD2] pt-8 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-display text-2xl font-medium text-[#1C1917]">Ready to grow with EVUDDY?</h4>
              <p className="mt-1 text-sm text-[#5C635E]">Join the partner network for the next wave of urban EV mobility.</p>
            </div>
            <Link href="/partners#partner-form" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 bg-[#1F6B4A] px-7 py-3.5 text-[13px] font-medium tracking-[0.08em] text-white sm:w-auto">
                Become a Partner
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
