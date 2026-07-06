"use client";

import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
};

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <section
      className="
      min-h-screen
      bg-gradient-to-br
      from-[#FFF8FB]
      via-white
      to-[#FFF5F9]
      "
    >
      <div
        className="
        max-w-[1700px]
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        xl:px-10
        py-8
        lg:py-10
        "
      >
        {children}
      </div>
    </section>
  );
}