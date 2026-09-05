"use client";

import { motion } from "framer-motion";
import { Bike, Briefcase, KeyRound } from "lucide-react";
import { BRAND } from "@/lib/brandMedia";
import HomeImg from "../HomeMedia/HomeImg";

const cards = [
  {
    icon: Bike,
    title: "Daily commute",
    text: "Hourly to monthly scooters from a live hub. GST-correct fare. Refundable deposit on normal rentals.",
    label: "B2C riders",
    image: BRAND.cityCommute,
  },
  {
    icon: Briefcase,
    title: "Gig & delivery",
    text: "Quiet electric range for city work. Pickup OTP at the yard. GPS on the scooter while you ride.",
    label: "Work on EVUDDY",
    image: BRAND.afterWork,
  },
  {
    icon: KeyRound,
    title: "Ride to own",
    text: "₹280 + GST a day for 18 months. No security deposit. Daily receipt. Ownership after a successful term.",
    label: "Rent to Own",
    image: BRAND.houseParked,
  },
];

export default function TrustSection() {
  return (
    <section className="relative bg-[#F7F4EE] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
            Who rides EVUDDY
          </span>
          <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
            One scooter. <span className="italic text-[#1F6B4A]">Three Indian journeys.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Built for riders, gig work and people who want the scooter to become theirs.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#1C1917]">
                  <HomeImg src={card.image} alt="" className="h-full w-full object-cover object-center" />
                </div>
                <Icon size={18} strokeWidth={1.5} className="mt-6 text-[#1F6B4A]" />
                <h3 className="font-display mt-5 text-2xl font-medium text-[#1C1917]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5C635E]">{card.text}</p>
                <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-[#1F6B4A]">
                  {card.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        <blockquote className="mt-16 border-t border-[#E4DDD2] pt-12 text-center">
          <p className="font-display mx-auto max-w-3xl text-2xl font-medium leading-snug text-[#1C1917] sm:text-4xl">
            &ldquo;The future of mobility isn&apos;t just electric. It&apos;s intelligent, sustainable, and built around people.&rdquo;
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5C635E]">
            EVUDDY connects KYC, hub OTP, Razorpay and Rent to Own into one India-first ride.
          </p>
          <p className="mt-6 text-[11px] font-medium tracking-[0.22em] text-[#1F6B4A]">— TEAM EVUDDY</p>
        </blockquote>
      </div>
    </section>
  );
}
