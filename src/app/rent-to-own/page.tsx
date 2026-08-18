"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import RentToOwnBooking from "@/app/components/RentToOwn/RentToOwnBooking";

export default function RentToOwnPage() {
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
          <h1 className="text-3xl font-black">Registration required</h1>
          <p className="mt-3 text-slate-500">Complete rider registration before Rent to Own.</p>
          <button
            onClick={() => (window.location.href = "/register")}
            className="mt-8 rounded-full bg-[#18B368] px-8 py-4 font-bold text-white"
          >
            Register now
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <RentToOwnBooking />
      </div>
      <Footer />
    </main>
  );
}
