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
      relative
      min-h-screen
      overflow-hidden
      bg-[#F5F7FB]
      "
    >
      {/* Background Decorations */}

      <div
        className="
        absolute
        top-[-180px]
        right-[-180px]
        w-[520px]
        h-[520px]
        rounded-full
        bg-emerald-400/10
        blur-[140px]
        pointer-events-none
        "
      />

      <div
        className="
        absolute
        bottom-[-220px]
        left-[-200px]
        w-[600px]
        h-[600px]
        rounded-full
        bg-sky-400/10
        blur-[160px]
        pointer-events-none
        "
      />

      <div
        className="
        absolute
        inset-0
        bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)]
        bg-[size:48px_48px]
        opacity-40
        pointer-events-none
        "
      />

      {/* Main Content */}

      <div
        className="
        relative
        z-10
        max-w-[1850px]
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