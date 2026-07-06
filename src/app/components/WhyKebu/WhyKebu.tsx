"use client";

import { motion } from "framer-motion";

export default function WhyKebu() {
  const features = [
    {
      icon: "⚡",
      title: "Kebu Bike On Rent",
      description:
        "Affordable bike rental solutions designed for modern cities and flexible urban mobility.",
    },
    {
      icon: "🏠",
      title: "Kebu Househelp",
      description:
        "Trusted maids, cooks, caregivers and household professionals verified for safety and quality.",
    },
    {
      icon: "📍",
      title: "Smart Tracking",
      description:
        "Real-time tracking and technology-driven operations for better customer experience.",
    },
    {
      icon: "💰",
      title: "Transparent Pricing",
      description:
        "Fair and competitive pricing with no hidden charges across all Kebu One services.",
    },
    {
      icon: "🛡️",
      title: "Trusted & Secure",
      description:
        "Built with customer safety, verified partners and secure transactions in mind.",
    },
    {
      icon: "🚀",
      title: "One Powerful Platform",
      description:
          "Choose Bike Rental, Househelp, Ride Booking or Delivery based on your needs.",
    },
  ];

  return (
    <section
      id="about"
     className="relative py-20 md:py-24 lg:py-32 bg-gradient-to-br from-[#081126] via-[#0A1134] to-[#151F45] overflow-hidden text-white">
      {/* Background Glow */}

<div className="absolute top-[-150px] left-[-150px] w-[700px] h-[700px] bg-pink-500/15 blur-[220px] rounded-full"></div>

<div className="absolute bottom-[-150px] right-[-150px] w-[700px] h-[700px] bg-[#EEB440]/15 blur-[220px] rounded-full"></div>
      <div className="max-w-7xl mx-auto px-6">

        <motion.div
initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:0.7}}
viewport={{once:true}}
className="text-center mb-16"
>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md mb-8">

  <span className="text-[#FF165E] font-bold tracking-[3px]">
    WHY KEBU ONE
  </span>

  <span className="w-2 h-2 bg-[#FF165E] rounded-full"></span>

  <span className="text-white/80">
    Trusted Urban Ecosystem
  </span>

</div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-black mb-8 leading-[0.95]">
  Why Urban India
  <br />
  Chooses Kebu One
</h2>

          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Kebu One combines smart mobility, trusted household
            services and technology-driven solutions into one
            seamless platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">

  <div className="px-5 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md">
    ✓ Operations First
  </div>

  <div className="px-5 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md">
    ✓ Technology Driven
  </div>

  <div className="px-5 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md">
    ✓ Multi-Service Platform
  </div>

  <div className="px-5 py-3 rounded-full bg-white/5 border border-pink-500/20 backdrop-blur-md">
    ✓ Built For Scale
  </div>

</div>

        </motion.div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent mb-16"></div>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {features.map((feature, index) => (

<motion.div
  key={index}
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.6,
    delay: index * 0.08,
  }}
  viewport={{ once: true }}
  whileHover={{
    y: -14,
    scale: 1.02,
  }}
  className="group relative overflow-hidden h-full flex flex-col bg-white/5 backdrop-blur-xl border border-pink-500/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 hover:border-pink-500 hover:shadow-[0_35px_90px_rgba(255,22,94,0.30)] transition-all duration-500"
>

<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]"></div>

<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-pink-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>

<div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-3xl bg-gradient-to-r from-[#FF165E] to-[#EEB440] flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl mb-8 shadow-[0_25px_60px_rgba(255,22,94,0.35)] group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
  {feature.icon}
</div>

<h3 className="text-3xl font-bold mb-4">
  {feature.title}
</h3>

<div className="flex gap-2 flex-wrap mb-5">

{feature.title === "Kebu Bike On Rent" && (
<>
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Flexible
</span>

<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Affordable
</span>
</>
)}

{feature.title === "Kebu Househelp" && (
<>
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Verified
</span>

<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Trusted
</span>
</>
)}

{feature.title === "Smart Tracking" && (
<>
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Real-Time
</span>

<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Technology
</span>
</>
)}

{feature.title === "Transparent Pricing" && (
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
No Hidden Charges
</span>
)}

{feature.title === "Trusted & Secure" && (
<>
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Secure
</span>

<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Reliable
</span>
</>
)}

{feature.title === "One Powerful Platform" && (
<>
<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
All-In-One
</span>

<span className="px-3 py-1 rounded-full bg-white/10 text-xs text-pink-300">
Unified
</span>
</>
)}

</div>

<p className="text-gray-300 leading-7 mb-6 flex-1">
{feature.description}
</p>


</motion.div>

))}

        </div>

      </div>
    </section>
  );
}