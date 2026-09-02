"use client";

import { motion } from "framer-motion";
import { BatteryCharging, Gauge, MapPinned, Zap } from "lucide-react";
import ServiceCard from "../ServiceCard/ServiceCard";

const specs = [
  { value: "120", label: "KM range", icon: BatteryCharging, color: "text-[#18B368]" },
  { value: "45", label: "km/h speed", icon: Gauge, color: "text-[#EC2A8C]" },
  { value: "4h", label: "Charging", icon: Zap, color: "text-[#18B368]" },
  { value: "GPS", label: "Live tracking", icon: MapPinned, color: "text-[#EC2A8C]" },
];

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#18B368]/10 blur-[110px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#EC2A8C]/8 blur-[100px]" />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]"
          >
            EVUDDY electric scooter
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl"
          >
            Built for{" "}
            <span className="text-[#18B368]">everyday mobility</span>
          </motion.h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-lg">
            A smart electric scooter for Indian city commuting — long range, hub charging and GPS on every ride.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14"
        >
          <ServiceCard
            icon="⚡"
            badge="Electric Scooter"
            stat="01"
            tags={["120 KM Range", "Fast Charging", "GPS Enabled", "Zero Emissions"]}
            title="EVUDDY Electric Scooter"
            color="from-[#18B368] to-[#16C45B]"
            description="Designed for effortless daily commuting with smart technology, long battery life, and a premium riding experience."
            image="/trans.png"
            link="/ride-options"
          />
        </motion.div>

        <div className="mt-10 grid grid-cols-2 divide-y divide-[#18B368]/10 overflow-hidden rounded-[24px] border border-[#18B368]/15 sm:mt-12 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="bg-[#F7FBFA] px-5 py-7 text-center">
                <Icon size={22} className={`mx-auto mb-3 ${spec.color}`} />
                <p className={`text-3xl font-black tracking-tight sm:text-4xl ${spec.color}`}>{spec.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{spec.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
