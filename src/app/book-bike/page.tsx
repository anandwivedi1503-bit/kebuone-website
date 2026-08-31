"use client";

import { useEffect, useState } from "react";

import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import BikeBooking from "@/app/components/BikeBooking/BikeBooking";
import RiderSessionBar from "@/app/components/RiderSession/RiderSessionBar";
import { getChosenPlan, hasRiderPlanReady, riderResumeHref, setChosenPlan } from "@/lib/riderPlanGate";

export default function BookBikePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasRiderPlanReady()) {
      window.location.replace("/ride-options");
      return;
    }

    const chosen = getChosenPlan();
    const rentalFlow =
      new URLSearchParams(window.location.search).get("flow") === "rental" ||
      chosen === "rental";

    if (chosen === "rto") {
      window.location.replace("/rent-to-own");
      return;
    }

    if (!rentalFlow) {
      window.location.replace(riderResumeHref());
      return;
    }

    setChosenPlan("rental");
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main>
        <Navbar />
      </main>
    );
  }

  return (
    <main>
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="pt-28 print:pt-0">
        <div className="print:hidden px-4 sm:px-6 lg:px-10">
          <RiderSessionBar />
        </div>
        <BikeBooking />
      </div>
      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}
