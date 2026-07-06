"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
  color: string;
  image?: string;
  link?: string;
  badge?: string;
  stat?: string;
  tags?: string[];
};

export default function ServiceCard({
  icon,
  title,
  description,
  color,
  link,
  image,
  badge,
  stat,
  tags,
}: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-[28px] lg:rounded-[36px] min-h-[340px] sm:min-h-[420px] lg:min-h-[560px] bg-cover bg-center border border-white/10 shadow-2xl cursor-pointer"
      style={{
  backgroundImage: image ? `url(${image})` : undefined,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition:
    title === "Kebu Bike On Rent"
      ? "center"
      : title === "Kebu Househelp"
      ? "center"
      : title === "Kebu Ride"
      ? "70% center"
      : "72% center",
}}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B1D]/95 via-[#050B1D]/75 to-black/25" />

      {/* Premium Glow */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#FF165E]/20 blur-[100px]" />

      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EEB440] via-[#FF5556] to-[#FF165E]" />

      <div className="relative z-20 flex h-full flex-col p-6 lg:p-8">

        <div className="absolute top-6 right-6">

<span className="text-white/30 text-6xl font-black">

{stat}

</span>

</div>

        <div
  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color}
  flex items-center justify-center text-2xl
  shadow-xl
  group-hover:scale-105 transition-all duration-500`}
>
  {icon}
</div>

        <div className="mt-6">

  {badge && (
   <span className="inline-block rounded-full bg-white/25 border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
      {badge}
    </span>
  )}

  <h3 className="mt-5 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-lg max-w-[320px]">
    {title}
  </h3>

  <p className="mt-4 max-w-md text-base lg:text-lg leading-7 text-white font-medium drop-shadow-md">
    {description}
  </p>

  <div className="mt-6 flex flex-wrap gap-3">
    {(tags ?? []).map((tag) => (
      <span
        key={tag}
        className="rounded-full bg-white/25 border border-white/20 px-4 py-2 text-sm font-semibold text-white shadow-md"
      >
        {tag}
      </span>
    ))}
  </div>

  <div className="flex-1"></div>

  <div className="mt-8">
    {link ? (
      <Link
        href={link}
        className="inline-flex items-center justify-center w-full sm:w-auto rounded-2xl bg-white px-7 py-3 font-bold text-[#071024] transition hover:scale-105"
      >
        Book Service →
      </Link>
    ) : (
      <span className="inline-flex items-center justify-center w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#FF165E] to-[#EEB440] px-7 py-3 font-bold text-white">
        Coming Soon
      </span>
    )}
  </div>

</div>
      </div>
    </motion.div>
  );
}