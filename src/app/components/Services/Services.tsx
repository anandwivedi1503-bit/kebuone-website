"use client";

import { motion } from "framer-motion";
import { BatteryCharging, Gauge, MapPinned, Zap } from "lucide-react";
import ServiceCard from "../ServiceCard/ServiceCard";
import { useHomeCatalog } from "../HomeCatalog/useHomeCatalog";

const specs = [
  { value: "120", label: "KM range", icon: BatteryCharging, color: "text-[#18B368]" },
  { value: "45", label: "km/h speed", icon: Gauge, color: "text-[#18B368]" },
  { value: "4h", label: "Charging", icon: Zap, color: "text-[#18B368]" },
  { value: "GPS", label: "Live tracking", icon: MapPinned, color: "text-[#18B368]" },
];

export default function Services() {
  const { catalog } = useHomeCatalog();
  const { product } = catalog;
  const model = product.vehicleModel || "EVUDDY Electric Scooter";
  const type = product.vehicleType || "Electric Scooter";

  return (
    <section id="services" className="relative scroll-mt-28 bg-[#F7F4EE] py-20 sm:scroll-mt-40 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]"
          >
            {type}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl"
          >
            Built for <span className="italic text-[#1F6B4A]">everyday mobility</span>
          </motion.h2>

          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
            Live fleet model: {model}. Battery {product.batteryType.toLowerCase()}. GPS on the scooter.
            Range about 120 km, about 45 km/h, about 4 hour charging.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14"
        >
          <ServiceCard
            badge={type}
            tags={["120 KM Range", product.batteryType, product.gpsLive ? "GPS live" : "GPS Enabled", "Zero Emissions"]}
            title={model}
            description="Designed for effortless daily commuting with smart technology, long battery life, and a premium riding experience."
            images={["/brand/scene-city-commute.png", "/new-vehicle.jpeg", "/brand/scene-after-work.png", "/brand/indian-city-road.png"]}
            link="/ride-options"
          />
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-y-8 border-t border-[#E4DDD2] pt-10 lg:grid-cols-4">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="px-2 sm:px-6">
                <Icon size={18} strokeWidth={1.5} className="mb-3 text-[#1F6B4A]" />
                <p className="font-display text-3xl font-medium text-[#1C1917] sm:text-4xl">{spec.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#8A847A]">{spec.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
