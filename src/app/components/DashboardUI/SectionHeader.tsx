"use client";

import { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
};

export default function SectionHeader({
  title,
  subtitle,
  rightContent,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="relative pl-3 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
          <span className="absolute left-0 top-1 h-[1.1em] w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 max-w-3xl pl-3 text-sm leading-6 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {rightContent ? <div className="flex flex-wrap items-center gap-2">{rightContent}</div> : null}
    </div>
  );
}
