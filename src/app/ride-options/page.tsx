"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowRight, Bike, KeyRound } from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/firebase";
import Navbar from "../Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { CATALOG_RATES, RTO_PLAN, rtoInstallment } from "@/lib/rentalPlans";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function RideOptionsPage() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const phone = user?.phoneNumber?.replace(/\D/g, "").slice(-10) || "";

      if (!user || !phone) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/riders?phone=${phone}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await response.json();

        setAllowed(
          Boolean(
            data.success &&
              data.data.bookingEnabled &&
              data.data.approvalStatus === "Approved" &&
              data.data.status === "Active"
          )
        );
      } catch {
        setAllowed(false);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) {
    return (
      <main>
        <Navbar />
        <div className="pt-40 text-center">
          <h2 className="text-2xl font-bold">Checking rider status...</h2>
        </div>
        <Footer />
      </main>
    );
  }

  if (!allowed) {
    return (
      <main>
        <Navbar />
        <div className="px-4 pt-40 pb-24 text-center">
          <h1 className="text-3xl font-black text-[#0F172A]">Registration required</h1>
          <p className="mt-3 text-slate-500">Complete rider registration before choosing a plan.</p>
          <Link href="/register" className="mt-8 inline-flex rounded-full bg-[#18B368] px-8 py-4 font-bold text-white">
            Register now
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="bg-[#F6FAF8] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">Choose your EVUDDY plan</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl">
            How do you want to ride?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            Pick a flexible rental, or own the scooter after 18 months of Rent to Own payments.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
          <Link
            href="/book-bike"
            className="group rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 sm:p-8"
          >
            <span className="inline-flex rounded-full bg-[#18B368]/10 px-3 py-1 text-xs font-bold text-[#18B368]">
              FLEXIBLE RENTAL
            </span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18B368] text-white">
              <Bike size={22} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#0F172A]">Normal booking</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Rent by the hour, day, week or month. Return the scooter when your plan ends.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">Hourly {formatINR(CATALOG_RATES.Hourly)}</span>
              <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">Daily {formatINR(CATALOG_RATES.Daily)}</span>
              <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">Weekly {formatINR(CATALOG_RATES.Weekly)}</span>
              <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">Monthly {formatINR(CATALOG_RATES.Monthly)}</span>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#18B368]">
              Continue to booking <ArrowRight size={16} />
            </span>
          </Link>

          <Link
            href="/rent-to-own"
            className="group rounded-[28px] border border-[#18B368]/20 bg-[#0B1B16] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 sm:p-8"
          >
            <span className="inline-flex rounded-full bg-[#18B368] px-3 py-1 text-xs font-bold">
              OWN AFTER 18 MONTHS
            </span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#18B368]">
              <KeyRound size={22} />
            </div>
            <h2 className="mt-5 text-2xl font-black">Rent to Own</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Pay {formatINR(RTO_PLAN.dailyRate)} per day for {RTO_PLAN.tenureMonths} months. After successful completion, the scooter becomes yours.
            </p>
            <div className="mt-5 rounded-2xl bg-white/8 p-4 text-sm">
              <p>First installment (30 days): <b>{formatINR(rtoInstallment())}</b> + 5% GST</p>
              <p className="mt-1 text-white/70">Refundable deposit extra, as applicable.</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#6EE7A8]">
              Start Rent to Own <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
