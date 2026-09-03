"use client";

import { motion } from "framer-motion";

const cards = [
  {
    title: "Daily commute",
    text: "Hourly to monthly scooters from a live hub. GST-correct fare. Refundable deposit on normal rentals.",
    label: "B2C riders",
  },
  {
    title: "Gig & delivery",
    text: "Quiet electric range for city work. Pickup OTP at the yard. GPS on the scooter while you ride.",
    label: "Work on EVUDDY",
  },
  {
    title: "Ride to own",
    text: "₹280 + GST a day for 18 months. No security deposit. Daily receipt. Ownership after a successful term.",
    label: "Rent to Own",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-[#F4F7F5] py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="ev-kicker">Who rides EVUDDY</p>
          <h2 className="ev-display mt-4 text-4xl text-[#0F172A] sm:text-6xl">
            One scooter.
            <span className="italic text-[#18B368]"> Three Indian journeys.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-slate-500">
            Built for riders, gig work and people who want the scooter to become theirs.
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-[#0F172A]/10 pt-12 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={i > 0 ? "lg:border-l lg:border-[#0F172A]/10 lg:pl-10" : ""}
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#18B368]">{card.label}</p>
              <h3 className="ev-display mt-3 text-3xl text-[#0F172A]">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-500">{card.text}</p>
            </motion.div>
          ))}
        </div>

        <blockquote className="mt-20 border-t border-[#0F172A]/10 pt-12">
          <p className="ev-display max-w-4xl text-3xl leading-[1.15] text-[#0F172A] sm:text-5xl">
            “The future of mobility isn’t just electric. It’s intelligent, sustainable, and built around people.”
          </p>
          <p className="mt-6 max-w-2xl text-sm text-slate-500">
            EVUDDY connects KYC, hub OTP, Razorpay and Rent to Own into one India-first ride.
          </p>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.22em] text-[#18B368]">— TEAM EVUDDY</p>
        </blockquote>
      </div>
    </section>
  );
}
