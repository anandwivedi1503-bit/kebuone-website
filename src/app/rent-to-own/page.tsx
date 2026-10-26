"use client";

import { useEffect, useState } from "react";

import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import RentToOwnBooking from "@/app/components/RentToOwn/RentToOwnBooking";
import { getChosenPlan, hasRiderPlanReady, setChosenPlan } from "@/lib/riderPlanGate";

export default function RentToOwnPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasRiderPlanReady()) {
      window.location.replace("/ride-options");
      return;
    }

    if (getChosenPlan() === "rental") {
      window.location.replace("/book-bike?flow=rental");
      return;
    }

    setChosenPlan("rto");
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
      <Navbar />
      <div className="page-under-nav">
        <RentToOwnBooking />
      </div>
      <Footer />
    </main>
  );
}
