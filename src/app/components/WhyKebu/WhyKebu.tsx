"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Yard-locked pickup",
    text: "OTP after first payment. No scooter leaves a hub without the yard.",
  },
  {
    title: "Live GPS on the scooter",
    text: "Same IoT feed ops use — lock, battery and location while you ride.",
  },
  {
    title: "Electric, GST-correct",
    text: "5% GST on rent only. Deposit is refundable and not taxed.",
  },
  {
    title: "24×7 rider helpdesk",
    text: "helpdesk@kebuone.in · +91 8726006512 · tickets on Book EV.",
  },
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="bg-[#F4F7F5] py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1280px] gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="ev-kicker">Why EVUDDY</p>
          <h2 className="ev-display mt-4 text-4xl text-[#0F172A] sm:text-6xl">
            Built for Indian streets,
            <span className="italic text-[#18B368]"> not imported playbooks.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-500">
            Technology, sustainability and a customer-first ride experience for modern Indian cities.
            Hubs, KYC, Razorpay, OTP pickup and Rent to Own on one platform.
          </p>
          <p className="mt-6 text-sm font-semibold tracking-[0.16em] text-[#18B368]">
            #safeRideWithEvuddy
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/ride-options" className="ev-cta w-full sm:w-auto">
              Book an EV
              <ArrowRight size={16} />
            </Link>
            <Link href="/ride-options" className="ev-cta-dark w-full sm:w-auto">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="divide-y divide-[#0F172A]/10 border-y border-[#0F172A]/10">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-6"
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#18B368]">
                0{i + 1}
              </p>
              <h4 className="ev-display mt-2 text-2xl text-[#0F172A]">{item.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
