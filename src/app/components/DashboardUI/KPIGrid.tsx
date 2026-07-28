"use client";

import { ReactNode } from "react";

type KPIGridProps = {
  children: ReactNode;
};

export default function KPIGrid({
  children,
}: KPIGridProps) {
  return (
    <div
      className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-2
      xl:grid-cols-3
      2xl:grid-cols-4
      gap-6
      xl:gap-7
      mb-12
      "
     >
       {children}
     </div>
  );
}