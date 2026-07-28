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
    <div
      className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-between
      gap-5
      mb-8
      "
    >
      <div>

        <h2
          className="
          text-3xl
          md:text-4xl
          font-black
          text-slate-900
          tracking-tight
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="
            mt-3
            text-slate-500
            text-base
            leading-7
            max-w-3xl
            "
          >
            {subtitle}
          </p>
        )}

      </div>

      {rightContent && (
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      )}

    </div>
  );
}