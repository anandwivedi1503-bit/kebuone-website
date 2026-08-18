"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main>
      <Navbar />
      <section className="bg-[#F7FBFA] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">EVUDDY</p>
          <h1 className="mt-3 text-3xl font-black text-[#0F172A] sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{updated}</p>
          <div className="mt-8 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">{children}</div>
          <Link href="/" className="mt-10 inline-flex font-bold text-[#18B368]">
            Back to home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
