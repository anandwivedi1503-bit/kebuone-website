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
      xl:grid-cols-3
      2xl:grid-cols-6
      gap-6
      mb-20
      "
    >

      {children}

    </div>

  );
}