"use client";

import { ReactNode } from "react";
import { ArrowUpRight, Activity } from "lucide-react";

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: "pink" | "green" | "blue" | "yellow" | "red" | "purple";
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: KPICardProps) {
  const colors = {
    pink: {
      border: "border-pink-100",
      bg: "bg-pink-50",
      text: "text-pink-600",
    },

    green: {
      border: "border-green-100",
      bg: "bg-green-50",
      text: "text-green-600",
    },

    blue: {
      border: "border-blue-100",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    yellow: {
      border: "border-yellow-100",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },

    red: {
      border: "border-red-100",
      bg: "bg-red-50",
      text: "text-red-600",
    },

    purple: {
      border: "border-purple-100",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  };

  return (
    <div
      className={`
      relative
      overflow-hidden
      rounded-[30px]
      border
      ${colors[color].border}
      bg-white
      p-7
      transition-all
      duration-300
      shadow-[0_10px_35px_rgba(15,23,42,0.05)]
      hover:-translate-y-2
      hover:shadow-[0_25px_60px_rgba(15,23,42,0.12)]
      `}
    >
      {/* Top Row */}

      <div className="flex justify-between items-start">

        <div
          className={`
          w-16
          h-16
          rounded-2xl
          flex
          items-center
          justify-center
          text-2xl
          ${colors[color].bg}
          ${colors[color].text}
          `}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={20}
          className="text-slate-400"
        />

      </div>

      {/* Title */}

      <p className="mt-8 text-slate-500 font-medium">
        {title}
      </p>

      {/* Value */}

      <h2
        className={`
        mt-3
        text-5xl
        font-black
        tracking-tight
        ${colors[color].text}
        `}
      >
        {value}
      </h2>

      {/* Bottom */}

      <div className="mt-8 flex items-center justify-between">

        <p
          className={`
          text-sm
          font-semibold
          ${colors[color].text}
          `}
        >
          {subtitle}
        </p>

        <Activity
          size={18}
          className="text-slate-300"
        />

      </div>

      {/* Decorative Circle */}

      <div
        className="
        absolute
        -top-10
        -right-10
        w-40
        h-40
        rounded-full
        bg-slate-100/40
        "
      />

    </div>
   );
}