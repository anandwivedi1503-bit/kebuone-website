"use client";

import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";

const cards = [
  {
    icon: Leaf,
    title: "Electric first",
    text: "Every decision is guided by cleaner transport and a smarter EV future.",
    label: "EVUDDY Vision",
  },
  {
    icon: ShieldCheck,
    title: "Trust and transparency",
    text: "Fair pricing, dependable service and long-term reliability for every rider.",
    label: "Our commitment",
  },
  {
    icon: Sparkles,
    title: "Built for tomorrow",
    text: "We keep evolving the ride experience for riders, partners and cities.",
    label: "Future ready",
  },
];

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#18B368]" />
            OUR COMMITMENT
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Built on trust.{" "}
            <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              Designed for tomorrow.
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            A cleaner, more reliable mobility ecosystem for riders, partners and businesses.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[24px] border border-slate-100 bg-white/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#18B368]/30 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18B368] text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#0F172A]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{card.text}</p>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#18B368]">
                  {card.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        <blockquote className="mt-10 rounded-[28px] bg-[#0B1B16] px-5 py-10 text-center text-white sm:px-12 sm:py-14">
          <p className="text-2xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
            &ldquo;The future of mobility isn&apos;t just electric. It&apos;s intelligent, sustainable, and built around people.&rdquo;
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-white/70 sm:text-base">
            EVUDDY connects technology, sustainability and everyday convenience into one ride experience.
          </p>
          <p className="mt-6 text-sm font-bold tracking-[0.18em] text-[#6EE7A8]">— TEAM EVUDDY</p>
        </blockquote>
      </div>
    </section>
  );
}
