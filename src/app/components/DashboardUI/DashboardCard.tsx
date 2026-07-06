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
      bg-white
      rounded-[32px]
      border
      border-pink-100
      shadow-lg
      hover:shadow-2xl
      transition-all
      duration-300
      overflow-hidden
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
          gap-4
          px-8
          py-6
          border-b
          border-pink-100
          bg-gradient-to-r
          from-pink-50
          to-white
          "
        >
          <div>
            {title && (
              <h3 className="text-2xl font-black text-[#0A1134]">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-2 text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          {rightContent && (
            <div>
              {rightContent}
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8">

        {children}

      </div>

    </div>
  );
}