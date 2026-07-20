"use client";

import { ReactNode } from "react";

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
  color = "pink",
}: KPICardProps) {

  const colors = {
    pink: {
      bg: "from-pink-50 to-white",
      border: "border-pink-100",
      text: "text-[#FF165E]",
      icon: "bg-pink-100",
    },
    green: {
      bg: "from-green-50 to-white",
      border: "border-green-100",
      text: "text-green-600",
      icon: "bg-green-100",
    },
    blue: {
      bg: "from-blue-50 to-white",
      border: "border-blue-100",
      text: "text-blue-600",
      icon: "bg-blue-100",
    },
    yellow: {
      bg: "from-yellow-50 to-white",
      border: "border-yellow-100",
      text: "text-yellow-600",
      icon: "bg-yellow-100",
    },
    red: {
      bg: "from-red-50 to-white",
      border: "border-red-100",
      text: "text-red-600",
      icon: "bg-red-100",
    },
    purple: {
      bg: "from-purple-50 to-white",
      border: "border-purple-100",
      text: "text-purple-600",
      icon: "bg-purple-100",
    },
  };

  return (

    <div
      className={`
      rounded-[30px]
      border
      bg-gradient-to-br
      ${colors[color].bg}
      ${colors[color].border}
      p-6
      shadow-lg
      hover:shadow-2xl
      hover:-translate-y-1
      transition-all
      duration-300
      `}
    >

      {icon && (

        <div
          className={`
          w-14
          h-14
          rounded-2xl
          flex
          items-center
          justify-center
          text-2xl
          mb-5
          ${colors[color].icon}
          `}
        >
          {icon}
        </div>

      )}

      <p className="text-gray-500 text-sm font-medium">
        {title}
      </p>

      <h2
  className={`
    mt-3
    text-3xl
    sm:text-4xl
    xl:text-5xl
    font-black
    break-words
    ${colors[color].text}
  `}
>
  {value}
</h2>

      {subtitle && (

        <p
          className={`mt-4 text-sm font-semibold ${colors[color].text}`}
        >
          {subtitle}
        </p>

      )}

    </div>

  );
}