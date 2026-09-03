"use client";

import { motion } from "framer-motion";
import ServiceCard from "../ServiceCard/ServiceCard";

const specs = [
  { value: "120", label: "KM range" },
  { value: "45", label: "km/h speed" },
  { value: "4h", label: "Charging" },
  { value: "GPS", label: "Live tracking" },
];

export default function Services() {
  return (
    <section id="services" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ev-kicker"
          >
            EVUDDY electric scooter
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ev-display mt-4 text-4xl text-[#0F172A] sm:text-6xl"
          >
            Built for{" "}
            <span className="italic text-[#18B368]">everyday mobility</span>
          </motion.h2>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500">
            A smart electric scooter for Indian city commuting — long range, hub charging and GPS on every ride.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14"
        >
          <ServiceCard
            badge="Electric Scooter"
            tags={["120 KM Range", "Fast Charging", "GPS Enabled", "Zero Emissions"]}
            title="EVUDDY Electric Scooter"
            description="Designed for effortless daily commuting with smart technology, long battery life, and a premium riding experience."
            image="/trans.png"
            link="/ride-options"
          />
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-y-10 border-t border-[#0F172A]/10 pt-10 sm:grid-cols-4">
          {specs.map((spec) => (
            <div key={spec.label} className="sm:px-6 first:sm:pl-0">
              <p className="ev-display text-5xl text-[#0F172A]">{spec.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#18B368]">
                {spec.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
