"use client";

import { motion } from "framer-motion";
import {
  BatteryCharging,
  Gauge,
  MapPinned,
  Zap,
} from "lucide-react";
import ServiceCard from "../ServiceCard/ServiceCard";

export default function Services() {
  return (
    <section
      id="services"
      className="
relative
overflow-hidden
py-32
bg-[radial-gradient(circle_at_top,#F8FFF9_0%,#FFFFFF_45%,#FFF8FC_100%)]
"
    >
      {/* Background Glow */}
      <div
className="
absolute
-top-28
-right-24
h-[420px]
w-[420px]
rounded-full
bg-[#18B368]/10
blur-[130px]
"
/>

<div
className="
absolute
-bottom-24
-left-20
h-[360px]
w-[360px]
rounded-full
bg-[#EC2A8C]/8
blur-[120px]
"
/>

      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 relative z-10">

        <div className="text-center mb-20">

  {/* Badge */}

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="
    inline-flex
    items-center
    gap-3
    rounded-full
    border
    border-[#18B368]/20
    bg-white/90
    backdrop-blur-md
    px-6
    py-2.5
    shadow-[0_12px_40px_rgba(0,0,0,0.08)]
    "
  >

    <span className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

    <span className="text-sm font-semibold text-gray-700">
      EVUDDY ELECTRIC SCOOTERS
    </span>

  </motion.div>

  {/* Heading */}

  <motion.h2
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    className="
    mt-8
    text-3xl
md:text-5xl
    md:text-6xl
    lg:text-7xl
    font-black
    tracking-[-0.04em]
    leading-[0.95]
    "
  >

    <span
      className="
      bg-gradient-to-r
      from-[#16C45B]
      via-[#18B368]
      via-[#4ADE80]
      to-[#EC2A8C]
      bg-clip-text
      text-transparent
      "
    >
      Built for
    </span>

    <br />

    <span
      className="
      bg-gradient-to-r
      from-[#16C45B]
      via-[#18B368]
      via-[#4ADE80]
      to-[#EC2A8C]
      bg-clip-text
      text-transparent
      "
    >
      Everyday Mobility
    </span>

  </motion.h2>

  {/* Subtitle */}

  <motion.p
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ delay: .2 }}
    viewport={{ once: true }}
    className="
    mt-8
    mx-auto
    max-w-3xl
   text-base
md:text-lg
lg:text-xl
leading-7
md:leading-9
    text-gray-500
    "
  >
    Discover EVUDDY's smart electric scooter designed for
    effortless city commuting, sustainable travel, and a
    seamless riding experience.
  </motion.p>

</div>

       <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
  className="mt-20"
>
  <ServiceCard
    icon="⚡"
    badge="Electric Scooter"
    stat="01"
    tags={[
      "120 KM Range",
      "Fast Charging",
      "GPS Enabled",
      "Zero Emissions",
    ]}
    title="EVUDDY Electric Scooter"
    color="from-[#18B368] to-[#16C45B]"
    description="Designed for effortless daily commuting with smart technology, long battery life, and a premium riding experience."
    image="/trans.png"
    link="/register"
  />
</motion.div>
<div className="my-20 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  viewport={{ once: true }}
  className="mt-16"
>
  <div className="grid grid-cols-2
md:grid-cols-2
lg:grid-cols-4 gap-6">

   <div className="rounded-[28px] bg-white/90 backdrop-blur-xl p-5
md:p-8 text-center border border-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_35px_80px_rgba(15,23,42,0.12)]">

  <BatteryCharging
    size={36}
    className="mx-auto mb-4 text-[#18B368]"
  />

  <h3 className="text-3xl
md:text-5xl font-black text-[#18B368]">
    120
  </h3>

  <p className="mt-2 text-lg font-semibold text-gray-800">
    KM Range
  </p>

</div>

    <div className="rounded-[28px] bg-white/90 backdrop-blur-xl p-5
md:p-8 text-center border border-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_35px_80px_rgba(15,23,42,0.12)]">

  <Gauge
    size={36}
    className="mx-auto mb-4 text-[#EC2A8C]"
  />

  <h3 className="text-3xl
md:text-5xl font-black text-[#EC2A8C]">
    45
  </h3>

  <p className="mt-2 text-lg font-semibold text-gray-800">
    km/h Speed
  </p>

</div>

    <div className="rounded-[28px] bg-white/90 backdrop-blur-xl p-5
md:p-8 text-center border border-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_35px_80px_rgba(15,23,42,0.12)]">

  <Zap
    size={36}
    className="mx-auto mb-4 text-[#18B368]"
  />

  <h3 className="text-3xl
md:text-5xl font-black text-[#18B368]">
    4h
  </h3>

  <p className="mt-2 text-lg font-semibold text-gray-800">
    Charging
  </p>

</div>

    <div className="rounded-[28px] bg-white/90 backdrop-blur-xl p-5
md:p-8 text-center border border-white shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_35px_80px_rgba(15,23,42,0.12)]">

  <MapPinned
    size={36}
    className="mx-auto mb-4 text-[#EC2A8C]"
  />

  <h3 className="text-3xl
md:text-5xl font-black text-[#EC2A8C]">
    GPS
  </h3>

  <p className="mt-2 text-lg font-semibold text-gray-800">
    Smart Tracking
  </p>

</div>

  </div>
</motion.div>

      </div>
    </section>
  );
}