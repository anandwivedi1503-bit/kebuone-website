"use client";

import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <section className="relative min-h-0 overflow-x-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1680px]">{children}</div>
    </section>
  );
}
