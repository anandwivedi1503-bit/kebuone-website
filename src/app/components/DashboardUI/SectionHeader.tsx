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
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {rightContent ? <div className="flex flex-wrap items-center gap-2">{rightContent}</div> : null}
    </div>
  );
}
