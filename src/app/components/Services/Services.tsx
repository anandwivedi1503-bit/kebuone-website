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
    <section id="services" className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#18B368]"
          >
            {type}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl lg:text-6xl"
          >
            Built for <span className="text-[#18B368]">everyday mobility</span>
          </motion.h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-lg">
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
            image="/new-vehicle.jpeg"
            link="/ride-options"
          />
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-y-8 border-t border-[#0F172A]/10 pt-10 sm:mt-12 lg:grid-cols-4">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="px-2 text-center sm:px-6">
                <Icon size={22} className={`mx-auto mb-3 ${spec.color}`} />
                <p className={`text-3xl font-black sm:text-5xl ${spec.color}`}>{spec.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{spec.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
