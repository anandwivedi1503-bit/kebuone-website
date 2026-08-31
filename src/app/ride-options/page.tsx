"use client";

import { useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { ArrowRight, Bike, KeyRound } from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/firebase";
import Navbar from "@/app/Navbar/Navbar";
import Footer from "@/app/components/Footer/Footer";
import { CATALOG_RATES, RTO_PLAN } from "@/lib/rentalPlans";
import RiderSessionBar from "@/app/components/RiderSession/RiderSessionBar";
import {
  getChosenPlan,
  getRideOptionsView,
  hasRiderPlanReady,
  logoutRider,
  markRiderPlanReady,
  riderResumeHref,
  setChosenPlan,
  setRideOptionsView,
} from "@/lib/riderPlanGate";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const phoneRegex = /^[6-9]\d{9}$/;
const OTP_COOLDOWN_SECONDS = 60;

const firebaseOtpError = (error: unknown) => {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  if (code === "auth/unauthorized-domain") {
    return "This domain is not allowed in Firebase. Add your hosting domain in Firebase Authentication settings.";
  }
  if (code === "auth/invalid-phone-number") {
    return "Enter a valid 10 digit Indian mobile number.";
  }
  if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") {
    return "Too many OTP attempts. Please wait and try again later.";
  }
  if (code === "auth/captcha-check-failed" || code === "auth/invalid-app-credential") {
    return "reCAPTCHA verification failed. Refresh the page and try again.";
  }
  if (code === "auth/invalid-verification-code") {
    return "Incorrect OTP. Please try again.";
  }

  return "Failed to send OTP. Check Firebase Phone Auth and try again.";
};

type View = "boot" | "otp" | "pending" | "plans" | "register";

export default function RideOptionsPage() {
  const [view, setView] = useState<View>("boot");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [riderId, setRiderId] = useState("");

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const [chosenPlan, setChosenPlanState] = useState<"rental" | "rto" | "">(() =>
    getChosenPlan()
  );

  useEffect(() => {
    if (hasRiderPlanReady() && getChosenPlan()) {
      window.location.replace(riderResumeHref());
      return;
    }

    if (hasRiderPlanReady()) {
      setView("plans");
      setRideOptionsView("plans");
      return;
    }

    const storedView = getRideOptionsView();
    if (storedView === "pending" || storedView === "register") {
      setRiderId(localStorage.getItem("kebu_rider_id") || "");
      setView(storedView);
      return;
    }

    setView("otp");
  }, []);

  useEffect(() => {
    if (view === "boot") return;
    setRideOptionsView(view);
  }, [view]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (view !== "pending" || !riderId) return;

    const poll = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch(`/api/riders/${riderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (
          data.success &&
          data.data.bookingEnabled &&
          data.data.approvalStatus === "Approved"
        ) {
          markRiderPlanReady();
          if (getChosenPlan()) {
            window.location.replace(riderResumeHref());
            return;
          }
          setView("plans");
        }
      } catch {
        // Keep waiting for admin approval.
      }
    };

    poll();
    const interval = window.setInterval(poll, 10000);
    return () => window.clearInterval(interval);
  }, [view, riderId]);

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    const container = document.getElementById("ride-options-recaptcha");
    if (container) container.innerHTML = "";
  };

  const applyRiderResult = (data: {
    success?: boolean;
    data?: {
      riderId?: string;
      bookingEnabled?: boolean;
      approvalStatus?: string;
      status?: string;
    };
  }) => {
    if (!data.success || !data.data) {
      setView("register");
      return;
    }

    if (data.data.riderId) {
      localStorage.setItem("kebu_rider_id", data.data.riderId);
      setRiderId(data.data.riderId);
    }

    const approved =
      Boolean(data.data.bookingEnabled) &&
      data.data.approvalStatus === "Approved" &&
      data.data.status === "Active";

    if (approved) {
      markRiderPlanReady();
      if (getChosenPlan()) {
        window.location.replace(riderResumeHref());
        return;
      }
      setView("plans");
      return;
    }

    if (
      data.data.approvalStatus === "Under Review" ||
      data.data.approvalStatus === "Approved"
    ) {
      setView("pending");
      return;
    }

    setView("register");
  };

  const sendOtp = async () => {
    try {
      setError("");
      setMessage("");
      const validPhone = phone.replace(/\D/g, "").slice(0, 10);

      if (!phoneRegex.test(validPhone)) {
        setError("Enter a valid 10 digit Indian mobile number.");
        return;
      }

      if (otpCooldown > 0) {
        setError(`Please wait ${otpCooldown}s before requesting another OTP.`);
        return;
      }

      setPhone(validPhone);
      setOtp("");
      setOtpLoading(true);
      confirmationRef.current = null;
      resetRecaptcha();

      recaptchaRef.current = new RecaptchaVerifier(auth, "ride-options-recaptcha", {
        size: "invisible",
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please send OTP again.");
          resetRecaptcha();
        },
      });

      await recaptchaRef.current.render();

      confirmationRef.current = await signInWithPhoneNumber(
        auth,
        `+91${validPhone}`,
        recaptchaRef.current
      );

      setOtpSent(true);
      setOtpCooldown(OTP_COOLDOWN_SECONDS);
      setMessage("OTP sent successfully.");
    } catch (err) {
      setError(firebaseOtpError(err));
      confirmationRef.current = null;
      resetRecaptcha();
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setError("");
      setMessage("");

      if (!confirmationRef.current) {
        setError("Please send OTP first.");
        return;
      }

      if (!/^[0-9]{6}$/.test(otp)) {
        setError("OTP must be 6 digits.");
        return;
      }

      setOtpLoading(true);
      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken(true);
      const verifiedPhone =
        result.user.phoneNumber?.replace(/\D/g, "").slice(-10) || phone;

      localStorage.setItem("kebu_rider_phone", verifiedPhone);

      const response = await fetch(`/api/riders?phone=${verifiedPhone}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      applyRiderResult(data);
    } catch (err) {
      setError(firebaseOtpError(err));
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <main>
      <Navbar />
      {view === "boot" && <section className="min-h-[40vh]" />}

      {view === "otp" && (
        <section className="bg-[#F6FAF8] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-lg rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
              Verify to continue
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#0F172A]">
              Confirm your mobile number
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Already registered riders must complete OTP verification before choosing
              Normal booking or Rent to Own. New riders can register directly. If you
              already verified OTP here, registration will not send a second SMS.
            </p>

            <label className="mt-8 block text-sm font-semibold text-[#0F172A]">
              Mobile number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                placeholder="10 digit mobile number"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#18B368]"
              />
            </label>

            {otpSent && (
              <label className="mt-4 block text-sm font-semibold text-[#0F172A]">
                OTP
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="6 digit OTP"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#18B368]"
                />
              </label>
            )}

            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
            {message && <p className="mt-4 text-sm font-semibold text-[#18B368]">{message}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpLoading || otpCooldown > 0}
                className="rounded-full bg-[#0B1B16] px-6 py-3 font-bold text-white disabled:opacity-60"
              >
                {otpLoading && !otpSent
                  ? "Sending..."
                  : otpCooldown > 0
                    ? `Resend in ${otpCooldown}s`
                    : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otpLoading}
                  className="rounded-full bg-[#18B368] px-6 py-3 font-bold text-white disabled:opacity-60"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              )}
            </div>

            <p className="mt-6 text-sm text-slate-500">
              New rider?{" "}
              <Link href="/register" className="font-bold text-[#18B368]">
                Complete registration
              </Link>
            </p>
            <div id="ride-options-recaptcha" />
          </div>
        </section>
      )}

      {view === "pending" && (
        <section className="px-4 pb-24 pt-40 text-center">
          <h1 className="text-3xl font-black text-[#0F172A]">Waiting for admin approval</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Your rider profile is under review. Ride options appear here as soon as an
            admin approves your account.
          </p>
        </section>
      )}

      {view === "register" && (
        <section className="px-4 pb-24 pt-40 text-center">
          <h1 className="text-3xl font-black text-[#0F172A]">Registration required</h1>
          <p className="mt-3 text-slate-500">
            This number is already verified. Complete registration — you will not get a second SMS.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex rounded-full bg-[#18B368] px-8 py-4 font-bold text-white"
          >
            Register now
          </Link>
        </section>
      )}

      {view === "plans" && (
        <section className="bg-[#F6FAF8] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
          <RiderSessionBar />
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#18B368]">
              Verification successful
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#0F172A] sm:text-5xl">
              How do you want to ride?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Pick a flexible rental, or own the scooter after 18 months of Rent to Own payments.
              Your choice stays locked until you logout, so refresh keeps you on the same path.
            </p>
            <button
              type="button"
              onClick={() => void logoutRider()}
              className="mt-5 text-sm font-bold text-slate-500 underline-offset-4 hover:text-[#EC2A8C] hover:underline"
            >
              Logout and start again
            </button>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
            <Link
              href="/book-bike?flow=rental"
              onClick={() => {
                setChosenPlan("rental");
                setChosenPlanState("rental");
              }}
              className={`group rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition sm:p-8 ${
                chosenPlan === "rto"
                  ? "pointer-events-none opacity-40 grayscale"
                  : "hover:-translate-y-1"
              }`}
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
                <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">
                  Hourly {formatINR(CATALOG_RATES.Hourly)}
                </span>
                <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">
                  Daily {formatINR(CATALOG_RATES.Daily)}
                </span>
                <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">
                  Weekly {formatINR(CATALOG_RATES.Weekly)}
                </span>
                <span className="rounded-xl bg-[#F7FBF8] px-3 py-2 font-semibold">
                  Monthly {formatINR(CATALOG_RATES.Monthly)}
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#18B368]">
                Continue to booking <ArrowRight size={16} />
              </span>
            </Link>

            {chosenPlan === "rental" ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-100 p-6 text-slate-500 sm:p-8">
                <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold">
                  FROZEN
                </span>
                <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-300 text-white">
                  <KeyRound size={22} />
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-600">Rent to Own</h2>
                <p className="mt-2 text-sm leading-6">
                  You chose normal booking. Rent to Own stays frozen for this session.
                  Logout if you need to switch plans.
                </p>
              </div>
            ) : (
            <Link
              href="/rent-to-own"
              onClick={() => setChosenPlan("rto")}
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
                Pay {formatINR(RTO_PLAN.dailyRate)} per day for {RTO_PLAN.tenureMonths} months.
                After successful completion, the scooter becomes yours.
              </p>
              <div className="mt-5 rounded-2xl bg-white/8 p-4 text-sm">
                <p>
                  Pay now: <b>{formatINR(RTO_PLAN.dailyRate)}</b> + 5% GST
                </p>
                <p className="mt-1 text-white/70">No security deposit. Own after {RTO_PLAN.tenureMonths} months.</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-[#6EE7A8]">
                Start Rent to Own <ArrowRight size={16} />
              </span>
            </Link>
            )}
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
