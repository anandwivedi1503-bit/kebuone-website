"use client";

import { useEffect, useState } from "react";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {

    const [greeting, setGreeting] = useState("Welcome");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const hour = today.getHours();

    setGreeting(
      hour < 12
        ? "Good Morning"
        : hour < 18
        ? "Good Afternoon"
        : "Good Evening"
    );

    setFormattedDate(
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(today)
    );
  }, []);

  return (

    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 mb-12">

      {/* Left */}

      <div>

        <p className="uppercase tracking-[4px] text-[#FF165E] font-bold mb-3">

          {greeting}

        </p>

        <h1
          className="
          text-3xl
          sm:text-4xl
          md:text-5xl
          xl:text-6xl
          font-black
          bg-gradient-to-r
          from-[#D6006E]
          via-[#FF165E]
          to-[#FF5556]
          bg-clip-text
          text-transparent
          "
        >
          {title}
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-3xl leading-8">
          {subtitle}
        </p>

      </div>

      {/* Right */}

      <div
        className="
        rounded-[32px]
        bg-white
        border
        border-pink-100
        shadow-xl
        p-7
        w-full
xl:w-auto
xl:min-w-[300px]
        "
      >

        <p className="text-gray-500 text-sm">
          Today
        </p>

        <h3 className="mt-2 text-2xl font-black text-[#0A1134]">

          {formattedDate}

        </h3>

        <div className="mt-6 flex items-center gap-3">

          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>

          <span className="text-green-600 font-semibold">

            All Systems Operational

          </span>

        </div>

      </div>

    </div>

  );

}