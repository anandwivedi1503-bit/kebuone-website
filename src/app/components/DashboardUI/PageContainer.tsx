"use client";

import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <section className="relative min-h-0">
      <div className="mx-auto max-w-[1680px]">{children}</div>
    </section>
  );
}
