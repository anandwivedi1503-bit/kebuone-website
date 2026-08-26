"use client";

import { ReactNode } from "react";

type KPIGridProps = {
  children: ReactNode;
};

export default function KPIGrid({
  children,
}: KPIGridProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
