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
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-40 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1680px]">{children}</div>
    </section>
  );
}
