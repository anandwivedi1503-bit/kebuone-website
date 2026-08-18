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
            className="inline-flex items-center gap-2 rounded-full border border-[#18B368]/20 bg-white px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-slate-700 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-[#18B368]" />
            EVUDDY ELECTRIC SCOOTERS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl"
          >
            Built for{" "}
            <span className="bg-gradient-to-r from-[#18B368] to-[#EC2A8C] bg-clip-text text-transparent">
              everyday mobility
            </span>
          </motion.h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-lg">
            A smart electric scooter for city commuting, with long range, fast charging and a premium ride.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-[#F7FBF8] px-4 py-2 text-sm font-semibold">Hourly ₹60</span>
            <span className="rounded-full bg-[#F7FBF8] px-4 py-2 text-sm font-semibold">Daily ₹230</span>
            <span className="rounded-full bg-[#F7FBF8] px-4 py-2 text-sm font-semibold">Weekly ₹1,610</span>
            <span className="rounded-full bg-[#F7FBF8] px-4 py-2 text-sm font-semibold">Monthly ₹6,900</span>
            <span className="rounded-full bg-[#0B1B16] px-4 py-2 text-sm font-semibold text-white">Rent to Own ₹280/day · 18 months</span>
          </div>
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
            link="/register"
          />
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.label}
                className="rounded-[22px] border border-slate-100 bg-[#F7FBF8] p-4 text-center sm:rounded-[28px] sm:p-7"
              >
                <Icon size={28} className={`mx-auto mb-3 ${spec.color}`} />
                <p className={`text-3xl font-black sm:text-5xl ${spec.color}`}>{spec.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700 sm:text-base">{spec.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
