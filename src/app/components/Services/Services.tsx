"use client";

import { motion } from "framer-motion";
import ServiceCard from "../ServiceCard/ServiceCard";

export default function Services() {
  return (
    <section
      id="services"
      className="relative py-32 bg-gradient-to-b from-[#FFF7FA] via-white to-[#FFF7FA] overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-20 right-0 w-[450px] h-[450px] rounded-full bg-[#FF165E]/10 blur-[180px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#EEB440]/10 blur-[180px]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-16">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex flex-wrap justify-center items-center gap-3 px-6 py-3 rounded-full bg-pink-50 border border-pink-100 mb-8"
          >
            <span className="text-pink-600 font-bold tracking-[3px]">
              KEBU ONE ECOSYSTEM
            </span>

            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>

            <span className="text-pink-600 font-semibold">
              4 Core Services
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0A1134] leading-[0.95] mb-6"
          >
            Urban Services
            <br />
            Reimagined
          </motion.h2>

          <p className="text-[#555] max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed">
            Kebu One combines Bike On Rent, mobility, deliveries and
            trusted home services into one seamless technology-driven
            ecosystem.
          </p>

          <div className="flex justify-center mt-8 mb-12">
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-10">

            <div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 font-bold text-[#0A1134]">
  ✓ Verified Partners
</div>

<div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 font-semibold text-[#0A1134]">
  ⚡ Technology Driven
</div>

<div className="px-5 py-3 rounded-full bg-white shadow-lg border border-pink-100 font-semibold text-[#0A1134]">
  📍 Real-Time Tracking
</div>

          </div>

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 mt-16 lg:mt-20"
        >

          <div>
            <ServiceCard
icon="⚡"
badge="Bike Rental"
stat="01"
tags={["Hourly","Daily","Electric"]}
              title="Kebu Bike On Rent"
              color="from-[#EEB440] to-[#FF9A3C]"
              description="Affordable electric bike rentals for everyday commuting."
              image="/biker-rent.jpeg"
              link="/register"
            />
          </div>

          <div>
            <ServiceCard
icon="🏠"
badge="Househelp"
stat="02"
tags={["Verified","Cleaning","Cooking"]}
              title="Kebu Househelp"
              color="from-[#FF165E] to-[#FF5E8A]"
              description="Verified maids, cooks, caregivers and trusted household professionals."
              image="/househelp.jpeg"
            />
          </div>

          <div>
            <ServiceCard
icon="🚕"
badge="Ride"
stat="03"
tags={["24/7","GPS","Safe Ride"]}
              title="Kebu Ride"
              color="from-[#0A1134] to-[#243B7A]"
              description="Reliable ride booking with professional drivers and transparent pricing."
              image="/cab.jpeg"
            />
          </div>

          <div> 
            <ServiceCard
icon="📦"
badge="Delivery"
stat="04"
tags={["Express","Business","Same Day"]}
              title="Kebu Delivery"
              color="from-[#FF5556] to-[#FF165E]"
              description="Fast and secure parcel delivery across your city."
              image="/delivery.jpeg"
            />
          </div>

        </motion.div>

      </div>
    </section>
  );
}