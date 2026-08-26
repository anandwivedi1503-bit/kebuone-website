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
    <div className="ops-glow mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-300 hover:border-emerald-200/80 sm:mb-8 sm:rounded-[28px]">
      {(title || subtitle || rightContent) && (
        <div className="flex flex-col gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/50 via-white to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
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
