"use client";

import { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  rightContent?: ReactNode;
  children: ReactNode;
};

export default function DashboardCard({
  title,
 subtitle,
  rightContent,
  children,
}: DashboardCardProps) {
  return (
    <div
      className="
      overflow-hidden
      rounded-[32px]
      border
      border-slate-200
      bg-white/90
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(15,23,42,0.06)]
      transition-all
      duration-300
      hover:shadow-[0_25px_70px_rgba(15,23,42,0.10)]
      "
    >
      {(title || subtitle || rightContent) && (

        <div
          className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-5
          px-8
          py-7
          border-b
          border-slate-200
          bg-gradient-to-r
          from-slate-50
          to-white
          "
        >

          <div>

            {title && (
              <h3 className="text-2xl font-bold text-slate-900">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-2 text-slate-500">
                {subtitle}
              </p>
            )}

          </div>

          {rightContent ? (
            <div className="flex items-center gap-4">
              {rightContent}
            </div>
          ) : null}

        </div>

      )}

      <div className="p-8">

        {children}

      </div>

    </div>
  );
}