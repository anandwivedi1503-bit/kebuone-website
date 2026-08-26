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
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(10,17,52,0.04)] transition duration-200 hover:border-[#18B368]/30 hover:shadow-[0_12px_28px_rgba(24,179,104,0.1)] sm:mb-8 sm:rounded-3xl">
      {(title || subtitle || rightContent) && (
        <div className="flex flex-col gap-3 border-b border-[#18B368]/10 bg-[#18B368]/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-medium tracking-[-0.02em] text-[#0A1134] sm:text-lg">
                {title}
              </h3>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
        </div>
      )}
      <div className="overflow-x-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
