"use client";

import { motion } from "framer-motion";
import { Bike, Briefcase, KeyRound } from "lucide-react";

const cards = [
  {
    icon: Bike,
    title: "Daily commute",
    text: "Hourly to monthly scooters from a live hub. GST-correct fare. Refundable deposit on normal rentals.",
    label: "B2C riders",
  },
  {
    icon: Briefcase,
    title: "Gig & delivery",
    text: "Quiet electric range for city work. Pickup OTP at the yard. GPS on the scooter while you ride.",
    label: "Work on EVUDDY",
  },
  {
    icon: KeyRound,
    title: "Ride to own",
    text: "₹280 + GST a day for 18 months. No security deposit. Daily receipt. Ownership after a successful term.",
    label: "Rent to Own",
  },
];

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]">
            Who rides EVUDDY
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            One scooter.{" "}
            <span className="text-[#18B368]">Three Indian journeys.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-slate-500 sm:text-lg">
            Built for riders, gig work and people who want the scooter to become theirs.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`px-1 ${i > 0 ? "lg:border-l lg:border-[#18B368]/15 lg:pl-10" : ""}`}
              >
                <Icon className="text-[#18B368]" size={22} />
                <h3 className="mt-4 text-xl font-bold text-[#0F172A]">{card.title}</h3>
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
            EVUDDY connects KYC, hub OTP, Razorpay and Rent to Own into one India-first ride.
          </p>
          <p className="mt-6 text-sm font-bold tracking-[0.18em] text-[#6EE7A8]">— TEAM EVUDDY</p>
        </blockquote>
      </div>
    </section>
  );
}
