"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

import { auth } from "@/lib/firebase";
import { gstBreakdown } from "@/lib/gst";
import {
  RTO_PLAN,
  rtoDailyRate,
  rtoInstallment,
  rtoTenureMonths,
} from "@/lib/rentalPlans";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type Vehicle = {
  _id: string;
  vehicleId: string;
  registrationNumber?: string;
  vehicleModel?: string;
  hourlyRate?: number;
  dailyRate?: number;
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

const COMPANY_SECURITY_DEPOSIT = 2500;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;

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
  const [riderId, setRiderId] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");

  const [city, setCity] = useState("");
  const [hub, setHub] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [occupation, setOccupation] = useState("");
  const [nomineeName, setNomineeName] = useState("");
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
  const dailyRate = rtoDailyRate(currentBike?.rentToOwnDailyRate);
  const tenureMonths = rtoTenureMonths(currentBike?.rentToOwnMonths);
  const installment = rtoInstallment(currentBike?.rentToOwnDailyRate);
  const tax = gstBreakdown(installment);
  const securityDeposit =
    Number(currentBike?.securityDeposit) > 0
      ? Number(currentBike?.securityDeposit)
      : COMPANY_SECURITY_DEPOSIT;
  const payableAmount = tax.totalWithGst + securityDeposit;

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

  const hubBikes = availableBikes.filter((bike) => {
    if (!hub) return false;
    const bikeHub = normalizeText(bike.currentHub);
    const keys = [selectedHub?.hubCode, selectedHub?.hubName, hub]
      .map(normalizeText)
      .filter(Boolean);
    return keys.some((key) => bikeHub === key || bikeHub.includes(key) || key.includes(bikeHub));
  });

  const bikes = hubBikes.length > 0 ? hubBikes : hub ? availableBikes : [];

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
      }
    });
    return () => unsubscribe();
  }, []);

  const createBooking = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!currentBike) {
      setError("Select a scooter.");
      return;
    }
    if (!nameRegex.test(nomineeName.trim())) {
      setError("Enter a valid nominee name.");
      return;
    }
    if (address.trim().length < 12) {
      setError("Enter your full permanent address.");
      return;
    }
    if (occupation.trim().length < 2) {
      setError("Enter your occupation.");
      return;
    }
    if (!agreed) {
      setError("Please accept the ownership agreement.");
      return;
    }

    setSaving(true);
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
          vehicleId: currentBike.vehicleId,
          startHub: selectedHub?.hubCode || currentBike.currentHub || hub,
          pickupHubName: selectedHub?.hubName || hub,
          hubAliases: [selectedHub?.hubName, selectedHub?.hubCode, hub, currentBike.currentHub].filter(Boolean),
          city,
          pickupCity: city,
          rentalMode: "Rent To Own",
          firebaseIdToken: token,
          rtoNomineeName: nomineeName.trim(),
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
      setMessage("Agreement saved. Pay the first 30-day installment to activate Rent to Own.");
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
      const token = firebaseIdToken || (await auth.currentUser?.getIdToken()) || "";
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingMongoId,
          amount: pendingAmount,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.message || "Unable to start payment.");
        return;
      }

      const openCheckout = () => {
        const razorpay = new window.Razorpay!({
          key: orderData.data.keyId,
          amount: orderData.data.amount,
          currency: "INR",
          name: "EVUDDY Rent to Own",
          description: bookingId,
          order_id: orderData.data.orderId,
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
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              setError(verifyData.message || "Payment verification failed.");
              return;
            }
            setPaymentSuccess(true);
            setPickupOtp(verifyData.data?.pickupOTP || verifyData.pickupOTP || "");
            setPendingAmount(0);
          },
          modal: {
            ondismiss: () => undefined,
          },
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

  const printCertificate = () => {
    window.print();
  };

  return (
    <section className="bg-[#F6FAF8] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#18B368]">Rent to Own</p>
        <h1 className="mt-2 text-3xl font-black text-[#0F172A] sm:text-5xl">Own your EVUDDY in {RTO_PLAN.tenureMonths} months</h1>
        <p className="mt-3 text-slate-500">
          {formatINR(RTO_PLAN.dailyRate)} per day. First payment is 30 days ({formatINR(rtoInstallment())}) plus 5% GST and deposit. After {RTO_PLAN.tenureMonths} months of successful payments, the scooter is transferred to you.
        </p>

        <div className="mt-6 flex gap-2 text-xs font-bold">
          {["Scooter", "Agreement", "Review", "Pay"].map((label, index) => (
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
            <label className="block text-sm font-bold">City</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setHub("");
              }}
              className="h-14 w-full rounded-2xl border border-slate-200 px-4"
            >
              <option value="">Select city</option>
              {cities.map((item) => (
                <option key={item.cityName} value={item.cityName}>
                  {item.cityName}
                </option>
              ))}
            </select>
            <label className="block text-sm font-bold">Hub</label>
            <select
              value={hub}
              onChange={(e) => setHub(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 px-4"
            >
              <option value="">Select hub</option>
              {filteredHubs.map((item) => (
                <option key={item.hubCode} value={item.hubCode}>
                  {item.hubName} ({item.hubCode})
                </option>
              ))}
            </select>
            <p className="text-sm font-bold">Available scooters</p>
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {bikes.map((bike) => (
                  <button
                    key={bike._id}
                    type="button"
                    onClick={() => setSelectedBike(bike.vehicleId)}
                    className={`rounded-2xl border p-4 text-left ${
                      selectedBike === bike.vehicleId
                        ? "border-[#18B368] bg-[#F0FDF4]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="font-black">{bike.vehicleId}</p>
                    <p className="text-sm text-slate-500">{bike.vehicleModel || "EVUDDY Scooter"}</p>
                    <p className="mt-2 text-sm font-semibold text-[#18B368]">
                      {formatINR(rtoDailyRate(bike.rentToOwnDailyRate))}/day
                    </p>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={!selectedBike}
              onClick={() => setStep(2)}
              className="h-14 w-full rounded-full bg-[#18B368] font-bold text-white disabled:bg-slate-300"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <form
            className="mt-8 space-y-4 rounded-[28px] bg-white p-5 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
          >
            <h2 className="text-2xl font-black">Ownership application</h2>
            <input className="h-14 w-full rounded-2xl border px-4" value={riderName} readOnly />
            <input className="h-14 w-full rounded-2xl border px-4" value={riderPhone} readOnly />
            <input
              className="h-14 w-full rounded-2xl border px-4"
              placeholder="Occupation *"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
            <input
              className="h-14 w-full rounded-2xl border px-4"
              placeholder="Nominee full name *"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
            />
            <textarea
              className="min-h-28 w-full rounded-2xl border px-4 py-3"
              placeholder="Permanent address *"
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
              I agree that paying {formatINR(dailyRate)} per day for {tenureMonths} months transfers ownership of scooter {selectedBike} to me after successful completion, subject to EVUDDY terms, GST and deposit rules.
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
              <FileText className="text-[#18B368]" /> Certificate preview
            </h2>
            <div className="rounded-2xl border border-dashed border-[#18B368]/40 bg-[#F7FBF8] p-5 text-sm leading-7">
              <p className="font-black">EVUDDY RENT TO OWN AGREEMENT</p>
              <p>Rider: {riderName} ({riderId})</p>
              <p>Vehicle: {selectedBike}</p>
              <p>Daily rate: {formatINR(dailyRate)} | Tenure: {tenureMonths} months</p>
              <p>First installment: {formatINR(installment)} + CGST 2.5% + SGST 2.5%</p>
              <p>Security deposit: {formatINR(securityDeposit)} (refundable, no GST)</p>
              <p>Nominee: {nomineeName}</p>
              <p>Address: {address}</p>
              <p className="mt-3 font-semibold">
                After {tenureMonths} months of successful installment payments, ownership of this scooter shall transfer to the rider.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0B1B16] p-5 text-white">
              <p>Payable now</p>
              <p className="text-3xl font-black">{formatINR(payableAmount)}</p>
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
            <p>Amount due: <b>{formatINR(pendingAmount || payableAmount)}</b></p>
            {!paymentSuccess ? (
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => void payWithRazorpay()}
                className="h-14 w-full rounded-full bg-[#18B368] font-bold text-white"
              >
                {paymentLoading ? "Opening Razorpay..." : "Pay first installment"}
              </button>
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
                <button
                  type="button"
                  onClick={printCertificate}
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
