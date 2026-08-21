"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Printer,
  ShieldCheck,
} from "lucide-react";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();

      setGreeting(
        hour < 12
          ? "Good Morning"
          : hour < 18
          ? "Good Afternoon"
          : "Good Evening"
      );

      setDate(
        new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)
      );

      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="
      rounded-[34px]
      border
      border-slate-200
      bg-white/80
      backdrop-blur-2xl
      shadow-[0_25px_60px_rgba(15,23,42,0.08)]
      p-5
      sm:p-8
      lg:p-10
      mb-8
      "
    >
      <div className="flex flex-col xl:flex-row justify-between gap-10">

        {/* LEFT */}

        <div className="flex-1">

          <p className="uppercase tracking-[0.16em] text-[#00B853] font-bold mb-3">
            {greeting}
          </p>

          <h1
            className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            xl:text-6xl
            font-black
            text-[#07111F]
            "
          >
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-lg sm:leading-8">
            {subtitle}
          </p>

        </div>

        {/* RIGHT */}

        <div
          className="
          xl:w-[360px]
          rounded-3xl
          border
          border-slate-200
          bg-gradient-to-br
          from-white
          to-slate-50
          shadow-lg
          p-5
          sm:p-7
          "
        >
          <div className="flex items-center gap-3">

            <CalendarDays
              size={22}
              className="text-[#00B853]"
            />

            <span className="font-semibold text-slate-600">
              {date}
            </span>

          </div>

          <div className="mt-5 flex items-center gap-3">

            <Clock3
              size={22}
              className="text-[#00B853]"
            />

            <span className="text-3xl font-black text-[#07111F]">
              {time}
            </span>

          </div>

          <div className="mt-7 h-px bg-slate-200" />

          <div className="mt-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <ShieldCheck
                size={22}
                className="text-green-500"
              />

              <div>

                <p className="font-bold text-green-600">
                  Systems Healthy
                </p>

                <p className="text-xs text-slate-500">
                  All services operational
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => window.print()}
              title="Print this dashboard"
              className="
              w-12
              h-12
              rounded-2xl
              bg-slate-100
              hover:bg-[#00B853]
              hover:text-white
              transition
              flex
              items-center
              justify-center
              "
            >
              <Printer size={20} />
            </button>

          </div>

        </div>

      </div>
     </div>
   );
 }