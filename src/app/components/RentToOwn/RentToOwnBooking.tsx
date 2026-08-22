"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

import { auth } from "@/lib/firebase";
import { notifyBrowser } from "@/lib/notifyBrowser";
import { gstBreakdown } from "@/lib/gst";
import {
  RTO_PLAN,
  rtoContractValue,
  rtoDailyRate,
  rtoInstallment,
  rtoTenureMonths,
} from "@/lib/rentalPlans";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill: { name: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type Vehicle = {
  _id: string;
  vehicleId: string;
  registrationNumber?: string;
  vehicleModel?: string;
  rentToOwnDailyRate?: number;
  rentToOwnMonths?: number;
  securityDeposit?: number;
  batteryPercentage?: number;
  currentHub?: string;
  vehicleStatus?: string;
};

type Hub = {
  hubName?: string;
  hubCode?: string;
  hubLocation?: string;
  city?: string;
};

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NOMINEE_RELATIONS = [
  "Spouse",
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Other",
];

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const normalizeText = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const inputClass =
  "h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#18B368]";

export default function RentToOwnBooking() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [cities, setCities] = useState<{ cityName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [riderId, setRiderId] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [walletAvailable, setWalletAvailable] = useState(0);

  const [city, setCity] = useState("");
  const [hub, setHub] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [occupation, setOccupation] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [bookingMongoId, setBookingMongoId] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pickupOtp, setPickupOtp] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentBike = vehicles.find((bike) => bike.vehicleId === selectedBike);
  const dailyRate = rtoDailyRate();
  const tenureMonths = rtoTenureMonths(currentBike?.rentToOwnMonths);
  const installment = rtoInstallment();
  const contractValue = rtoContractValue(undefined, tenureMonths);
  const tax = gstBreakdown(installment);
  const payableAmount = tax.totalWithGst;

  const filteredHubs = useMemo(() => {
    if (!city) return [];
    return hubs.filter((item) => normalizeText(item.city) === normalizeText(city));
  }, [city, hubs]);

  const selectedHub = hubs.find(
    (item) => normalizeText(item.hubCode) === normalizeText(hub)
  );

  const availableBikes = vehicles.filter((bike) => {
    const status = normalizeText(bike.vehicleStatus);
    return status === "available" || status === "";
  });

  const bikes = availableBikes;

  const loadData = async (selectedCity = "") => {
    try {
      setLoading(true);
      const hubUrl = selectedCity
        ? `/api/hubs?city=${encodeURIComponent(selectedCity)}`
        : "/api/hubs";
      const [vehicleRes, cityRes, hubRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/cities"),
        fetch(hubUrl),
      ]);
      const vehicleData = await vehicleRes.json();
      const cityData = await cityRes.json();
      const hubData = await hubRes.json();
      if (vehicleData.success) setVehicles(vehicleData.data || []);
      if (cityData.success) setCities(cityData.data || []);
      if (hubData.success) setHubs(hubData.data || []);
    } catch {
      setError("Unable to load Rent to Own data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (city) void loadData(city);
  }, [city]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.phoneNumber) return;
      const token = await user.getIdToken();
      const phone = user.phoneNumber.replace(/\D/g, "").slice(-10);
      setFirebaseIdToken(token);
      setRiderPhone(phone);
      const res = await fetch(`/api/riders?phone=${phone}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRiderName(data.data.fullName || "");
        setRiderId(data.data.riderId || "");
        setRiderEmail(data.data.email || "");
        setWalletAvailable(Number(data.data.walletAvailable ?? data.data.walletBalance ?? 0));
      }
    });
    return () => unsubscribe();
  }, []);

  const validateApplication = () => {
    if (!currentBike) return "Select a scooter.";
    if (!emailRegex.test(riderEmail.trim())) return "Enter a valid email address.";
    if (occupation.trim().length < 2) return "Enter your occupation.";
    if (!nameRegex.test(guardianName.trim())) return "Enter father / guardian full name.";
    if (!nameRegex.test(nomineeName.trim())) return "Enter a valid nominee name.";
    if (!NOMINEE_RELATIONS.includes(nomineeRelation)) return "Select nominee relation.";
    if (!phoneRegex.test(emergencyPhone)) return "Enter a valid 10-digit emergency mobile number.";
    if (emergencyPhone === riderPhone) return "Emergency contact must be different from your number.";
    if (address.trim().length < 12) return "Enter your full permanent address.";
    if (!agreed) return "Please accept the ownership agreement.";
    return "";
  };

  const goToReview = (event: FormEvent) => {
    event.preventDefault();
    const nextError = validateApplication();
    if (nextError) {
      setError(nextError);
      return;
    }
    setError("");
    setStep(3);
  };

  const createBooking = async (event: FormEvent) => {
    event.preventDefault();
    const nextError = validateApplication();
    if (nextError) {
      setError(nextError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const token = firebaseIdToken || (await auth.currentUser?.getIdToken()) || "";
      const newBookingId = "RTO-" + Date.now();
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: newBookingId,
          userName: riderName,
          userPhone: riderPhone,
          riderId,
          vehicleId: currentBike?.vehicleId,
          startHub: selectedHub?.hubCode || currentBike?.currentHub || hub,
          pickupHubName: selectedHub?.hubName || hub,
          hubAliases: [
            selectedHub?.hubName,
            selectedHub?.hubCode,
            selectedHub?.hubLocation,
            hub,
            currentBike?.currentHub,
          ].filter(Boolean),
          city,
          pickupCity: city,
          rentalMode: "Rent To Own",
          firebaseIdToken: token,
          rtoNomineeName: nomineeName.trim(),
          rtoNomineeRelation: nomineeRelation,
          rtoGuardianName: guardianName.trim(),
          rtoEmergencyPhone: emergencyPhone,
          rtoEmail: riderEmail.trim(),
          rtoPermanentAddress: address.trim(),
          rtoOccupation: occupation.trim(),
          rtoAgreementAccepted: true,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        setError(bookingData.errors?.join(" ") || bookingData.message || "Could not start Rent to Own.");
        return;
      }
      setBookingId(newBookingId);
      setBookingMongoId(bookingData.data._id);
      setCertificateNumber(bookingData.data.rtoCertificateNumber || "");
      setPendingAmount(Number(bookingData.data.pendingAmount || payableAmount));
      setMessage("Agreement saved. Pay the full first installment to activate Rent to Own.");
      setStep(4);
    } catch {
      setError("Could not create the Rent to Own booking.");
    } finally {
      setSaving(false);
    }
  };

  const payWithRazorpay = async () => {
    setError("");
    setPaymentLoading(true);
    try {
      const payNow = Number(pendingAmount || payableAmount);
      const token = firebaseIdToken || (await auth.currentUser?.getIdToken()) || "";
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingMongoId,
          amount: payNow,
          firebaseIdToken: token,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.message || "Unable to start payment.");
        return;
      }

      const keyId = orderData.keyId || orderData.data?.keyId;
      const orderId = orderData.orderId || orderData.data?.orderId;
      const orderAmount = orderData.amount || orderData.data?.amount;

      const openCheckout = () => {
        const razorpay = new window.Razorpay!({
          key: keyId,
          amount: orderAmount,
          currency: orderData.currency || "INR",
          name: orderData.name || "EVUDDY Rent to Own",
          image: orderData.image,
          description: bookingId,
          order_id: orderId,
          prefill: { name: riderName, contact: riderPhone },
          notes: { bookingMongoId },
          theme: { color: "#18B368" },
          handler: async (response: RazorpayResponse) => {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingMongoId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                firebaseIdToken: token,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setError(verifyData.message || "Payment verification failed.");
              return;
            }
            setPaymentSuccess(true);
            setPendingAmount(0);
            setPickupOtp(verifyData.data?.pickupOTP || verifyData.pickupOTP || "");
            setMessage("Rent to Own activated. Collect the scooter with your pickup OTP.");
            notifyBrowser(
              "EVUDDY Rent to Own",
              "Payment successful. Collect the scooter with your pickup OTP."
            );
          },
          modal: {
            ondismiss: () => {
              setPaymentLoading(false);
              setError("Payment cancelled. You can try again.");
            },
          },
        });
        razorpay.on("payment.failed", (response) => {
          setPaymentLoading(false);
          setError(response.error?.description || "Payment failed. Please try again.");
        });
    razorpay.open();
      };

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = openCheckout;
        document.body.appendChild(script);
      } else {
        openCheckout();
      }
    } catch {
      setError("Payment could not be started.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const payWithWallet = async () => {
    setError("");
    setPaymentLoading(true);
    try {
      const payNow = Number(pendingAmount || payableAmount);
      if (walletAvailable < payNow) {
        setError(`Wallet has ${formatINR(walletAvailable)}. Pay with Razorpay or recharge.`);
        return;
      }
      const token = firebaseIdToken || (await auth.currentUser?.getIdToken()) || "";
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingMongoId,
          amount: payNow,
          useWallet: true,
          firebaseIdToken: token,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.message || "Wallet payment failed.");
        return;
      }
      setWalletAvailable((old) => Number(Math.max(0, old - payNow).toFixed(2)));
      setPaymentSuccess(true);
      setPendingAmount(Number(orderData.pendingAmount ?? 0));
      setPickupOtp(orderData.pickupOTP || "");
      setMessage(orderData.message || "Rent to Own activated from wallet. Collect the scooter with your pickup OTP.");
      notifyBrowser(
        "EVUDDY Rent to Own",
        "Wallet payment successful. Collect the scooter with your pickup OTP."
      );
    } catch {
      setError("Wallet payment could not be started.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <section className="bg-[#F6FAF8] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">Rent to Own</p>
        <h1 className="mt-2 text-3xl font-black text-[#0F172A] sm:text-5xl">
          Own your EVUDDY in {RTO_PLAN.tenureMonths} months
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Fixed plan: {formatINR(dailyRate)} per day for {tenureMonths} months. Pay {formatINR(dailyRate)} plus 5% GST now.
          There is no security deposit. After {tenureMonths} months of successful payments, ownership of the scooter transfers to you.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Daily</p>
            <p className="mt-1 text-xl font-black">{formatINR(dailyRate)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase text-slate-400">Pay now</p>
            <p className="mt-1 text-xl font-black">{formatINR(installment)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase text-slate-400">GST 5%</p>
            <p className="mt-1 text-xl font-black">{formatINR(tax.gstAmount)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 text-[11px] font-bold sm:flex sm:flex-wrap sm:text-xs">
          {["Scooter", "Application", "Agreement", "Pay"].map((label, index) => (
            <span
              key={label}
              className={`rounded-full px-3 py-1 ${
                step === index + 1 ? "bg-[#18B368] text-white" : "bg-white text-slate-500"
              }`}
            >
              {index + 1}. {label}
            </span>
          ))}
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-600">{error}</p> : null}
        {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">{message}</p> : null}

        {step === 1 && (
          <div className="mt-8 space-y-4 rounded-[28px] bg-white p-5 sm:p-8">
            <label className="block text-sm font-bold">City *</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setHub("");
              }}
              className={inputClass}
            >
              <option value="">Select city</option>
              {cities.map((item) => (
                <option key={item.cityName} value={item.cityName}>
                  {item.cityName}
                </option>
              ))}
            </select>
            <label className="block text-sm font-bold">Pickup hub *</label>
            <select value={hub} onChange={(e) => setHub(e.target.value)} className={inputClass}>
              <option value="">Select hub</option>
              {filteredHubs.map((item) => (
                <option key={item.hubCode} value={item.hubCode}>
                  {item.hubName} ({item.hubCode})
                </option>
              ))}
            </select>
            <p className="text-sm font-bold">Available scooters *</p>
            {loading ? (
              <p className="text-slate-500">Loading scooters...</p>
            ) : bikes.length === 0 ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No scooters are marked Available right now. Ask admin to set bikes to Available.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {bikes.map((bike) => (
                  <button
                    key={bike._id}
                    type="button"
                    onClick={() => setSelectedBike(bike.vehicleId)}
                    className={`min-h-[7rem] rounded-2xl border p-4 text-left ${
                      selectedBike === bike.vehicleId
                        ? "border-[#18B368] bg-[#F0FDF4]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="font-black">{bike.vehicleId}</p>
                    <p className="text-sm text-slate-500">{bike.vehicleModel || "EVUDDY Scooter"}</p>
                    {bike.registrationNumber ? (
                      <p className="text-xs text-slate-400">Reg: {bike.registrationNumber}</p>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      Hub: {bike.currentHub || "-"} · Battery: {bike.batteryPercentage ?? "-"}%
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#18B368]">
                      {formatINR(dailyRate)}/day · {tenureMonths} months
                    </p>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={!selectedBike || !city || !hub}
              onClick={() => setStep(2)}
              className="h-14 w-full rounded-full bg-[#18B368] font-bold text-white disabled:bg-slate-300"
            >
              Continue to application
            </button>
          </div>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-4 rounded-[28px] bg-white p-5 sm:p-8" onSubmit={goToReview}>
            <h2 className="text-2xl font-black">Ownership application</h2>
            <p className="text-sm text-slate-500">
              KYC is already on file. Complete the Rent to Own details required for the 18-month ownership contract.
            </p>
            <label className="block text-sm font-bold">Rider name</label>
            <input className={inputClass} value={riderName} readOnly />
            <label className="block text-sm font-bold">Registered mobile</label>
            <input className={inputClass} value={riderPhone} readOnly />
            <label className="block text-sm font-bold">Email *</label>
            <input
              className={inputClass}
              value={riderEmail}
              onChange={(e) => setRiderEmail(e.target.value)}
              placeholder="name@email.com"
            />
            <label className="block text-sm font-bold">Occupation *</label>
            <input
              className={inputClass}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Delivery partner, Student, Private job"
            />
            <label className="block text-sm font-bold">Father / guardian name *</label>
            <input
              className={inputClass}
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Full name"
            />
            <label className="block text-sm font-bold">Nominee full name *</label>
            <input
              className={inputClass}
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              placeholder="Person who receives ownership if required"
            />
            <label className="block text-sm font-bold">Nominee relation *</label>
            <select
              className={inputClass}
              value={nomineeRelation}
              onChange={(e) => setNomineeRelation(e.target.value)}
            >
              <option value="">Select relation</option>
              {NOMINEE_RELATIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label className="block text-sm font-bold">Emergency contact number *</label>
            <input
              className={inputClass}
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10 digit mobile number"
              inputMode="numeric"
            />
            <label className="block text-sm font-bold">Permanent address *</label>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#18B368]"
              placeholder="House / street, area, city, PIN"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to pay {formatINR(dailyRate)} per day for {tenureMonths} months. Today I pay {formatINR(dailyRate)} plus 5% GST
              (CGST 2.5% + SGST 2.5%). Rent to Own has no security deposit. After successful completion, ownership
              of scooter {selectedBike} transfers to me, subject to EVUDDY terms.
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="h-14 flex-1 rounded-full border font-bold">
                Back
              </button>
              <button type="submit" className="h-14 flex-1 rounded-full bg-[#18B368] font-bold text-white">
                Review agreement
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={createBooking} className="mt-8 space-y-4 rounded-[28px] bg-white p-5 sm:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-black">
              <FileText className="text-[#18B368]" /> Rent to Own agreement
            </h2>
            <div id="rto-certificate" className="rounded-2xl border border-dashed border-[#18B368]/40 bg-[#F7FBF8] p-5 text-sm leading-7">
              <p className="font-black">EVUDDY RENT TO OWN AGREEMENT</p>
              <p>Rider: {riderName} ({riderId})</p>
              <p>Mobile: {riderPhone} | Email: {riderEmail}</p>
              <p>Father / guardian: {guardianName}</p>
              <p>Occupation: {occupation}</p>
              <p>Vehicle: {selectedBike} {currentBike?.vehicleModel ? `· ${currentBike.vehicleModel}` : ""}</p>
              <p>Registration: {currentBike?.registrationNumber || "-"}</p>
              <p>City / hub: {city} / {selectedHub?.hubName || hub}</p>
              <p>Daily rate: {formatINR(dailyRate)} | Tenure: {tenureMonths} months</p>
              <p>Contract rental value: {formatINR(contractValue)}</p>
              <p>Amount now: {formatINR(installment)} + 5% GST</p>
              <p>CGST 2.5%: {formatINR(tax.cgstAmount)} | SGST 2.5%: {formatINR(tax.sgstAmount)}</p>
              <p>Security deposit: None for Rent to Own</p>
              <p>Payable now: {formatINR(payableAmount)}</p>
              <p>Nominee: {nomineeName} ({nomineeRelation})</p>
              <p>Emergency contact: {emergencyPhone}</p>
              <p>Permanent address: {address}</p>
              <p className="mt-3 font-semibold">
                After {tenureMonths} months of successful installment payments, ownership of this scooter shall
                transfer to the rider named above.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0B1B16] p-5 text-white">
              <p>Payable now ({formatINR(dailyRate)} + GST)</p>
              <p className="text-3xl font-black">{formatINR(payableAmount)}</p>
              <p className="mt-2 text-sm text-white/70">
                {formatINR(installment)} + {formatINR(tax.gstAmount)} GST · no deposit
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="h-14 flex-1 rounded-full border font-bold">
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-14 flex-1 rounded-full bg-[#18B368] font-bold text-white"
              >
                {saving ? "Saving..." : "Confirm and pay"}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="mt-8 space-y-4 rounded-[28px] bg-white p-5 sm:p-8">
            <h2 className="text-2xl font-black">Payment & certificate</h2>
            <p>Booking ID: <b>{bookingId}</b></p>
            {certificateNumber ? <p>Certificate: <b>{certificateNumber}</b></p> : null}
            <div className="rounded-2xl bg-[#F7FBF8] p-4 text-sm">
              <p>Rent to Own: {formatINR(dailyRate)} per day</p>
              <p>Amount: {formatINR(installment)}</p>
              <p>CGST 2.5% {formatINR(tax.cgstAmount)} + SGST 2.5% {formatINR(tax.sgstAmount)}</p>
              <p>No security deposit on Rent to Own</p>
              <p className="mt-2 font-semibold">Pay now: {formatINR(pendingAmount || payableAmount)}</p>
            </div>
            {!paymentSuccess ? (
              <>
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => void payWithRazorpay()}
                className="h-14 w-full rounded-full bg-[#18B368] font-bold text-white disabled:bg-slate-300"
              >
                {paymentLoading
                  ? "Processing..."
                  : `Pay ${formatINR(pendingAmount || payableAmount)} with Razorpay`}
              </button>
              <button
                type="button"
                disabled={
                  paymentLoading ||
                  walletAvailable < Number(pendingAmount || payableAmount)
                }
                onClick={() => void payWithWallet()}
                className="h-14 w-full rounded-full border border-[#18B368] bg-white font-bold text-[#0F172A] disabled:opacity-50"
              >
                {walletAvailable < Number(pendingAmount || payableAmount)
                  ? `Wallet ${formatINR(walletAvailable)} — not enough`
                  : `Pay ${formatINR(pendingAmount || payableAmount)} from wallet`}
              </button>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="flex items-center gap-2 font-black text-emerald-700">
                  <CheckCircle2 /> Rent to Own activated
                </p>
                {pickupOtp ? (
                  <p className="mt-2 flex items-center gap-2 text-lg font-black">
                    <ShieldCheck /> Pickup OTP: {pickupOtp}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-emerald-800">
                  Show this OTP at the hub to collect scooter {selectedBike}. Keep the certificate for your records.
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="mt-4 h-12 rounded-full border border-emerald-700 px-6 font-bold text-emerald-800"
                >
                  Print / save certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
