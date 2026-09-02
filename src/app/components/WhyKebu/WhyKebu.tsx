"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, Leaf, MapPinned, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Yard-locked pickup",
    text: "OTP after first payment. No scooter leaves a hub without the yard.",
  },
  {
    icon: MapPinned,
    title: "Live GPS on the scooter",
    text: "Same IoT feed ops use — lock, battery and location while you ride.",
  },
  {
    icon: Leaf,
    title: "Electric, GST-correct",
    text: "5% GST on rent only. Deposit is refundable and not taxed.",
  },
  {
    icon: HeartHandshake,
    title: "24×7 rider helpdesk",
    text: "helpdesk@kebuone.in · +91 8726006512 · tickets on Book EV.",
  },
];

export default function WhyChoose() {
  return (
    <section id="why-choose" className="relative overflow-hidden bg-[#F6FAF8] py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#18B368]/10 blur-[110px]" />
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
            Why EVUDDY
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Built for Indian streets,{" "}
            <span className="text-[#18B368]">not imported playbooks.</span>
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
              Built like India&apos;s next EV network.
            </h3>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-lg">
              Hubs, KYC, Razorpay, OTP pickup and Rent to Own on one platform — for daily riders,
              gig work and people who want to own the scooter.
            </p>
            <span className="mt-6 inline-flex rounded-full bg-[#18B368]/10 px-4 py-2 text-sm font-semibold text-[#18B368]">
              #safeRideWithEvuddy
            </span>
          </motion.div>

          <div className="divide-y divide-[#18B368]/12 overflow-hidden rounded-[28px] border border-[#18B368]/15 bg-white">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 px-5 py-5 sm:px-7 sm:py-6">
                  <Icon className="mt-0.5 shrink-0 text-[#18B368]" size={22} />
                  <div>
                    <h4 className="text-lg font-bold text-[#0F172A]">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p>
                  </div>
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
            <Link href="/ride-options" className="w-full sm:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#18B368] px-8 py-4 font-bold text-white sm:w-auto">
                Book an EV
                <ArrowRight size={18} />
              </span>
            </Link>
            <Link href="/ride-options" className="w-full sm:w-auto">
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
