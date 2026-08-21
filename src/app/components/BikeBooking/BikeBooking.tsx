"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Bike,
  CheckCircle2,
  CreditCard,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { gstBreakdown } from "@/lib/gst";
import { CATALOG_RATES, RTO_PLAN, catalogRate } from "@/lib/rentalPlans";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
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
  chassisNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  batteryType?: string;
  registrationType?: string;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  hourlyRate?: number;
  securityDeposit?: number;
  batteryPercentage?: number;
  currentHub?: string;
  vehicleStatus?: string;
};

type Hub = {
  _id?: string;
  hubName?: string;
  hubCode?: string;
  hubLocation?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

type CityRecord = {
  _id?: string;
  cityName: string;
  state?: string;
  status?: string;
};

const COMPANY_SECURITY_DEPOSIT = 2500;
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");
const cleanDigits = (value: string) => value.replace(/\D/g, "");
const normalizeIndianPhone = (value: string) => {
  const digits = cleanDigits(value);

  if (!digits) return "";

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 10) {
    return digits;
  }

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return digits;
};
const amount = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};
const normalizeText = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export default function BikeBooking() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
const [cities, setCities] = useState<CityRecord[]>([]);
const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [city, setCity] = useState("");
  const [hub, setHub] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [bikeSearch, setBikeSearch] = useState("");
  const [rentalMode, setRentalMode] = useState<
    "Hourly" | "Daily" | "Weekly" | "Monthly"
  >("Daily");
  const [referenceBy, setReferenceBy] = useState("");

  const [bookingId, setBookingId] = useState("");
  const [bookingMongoId, setBookingMongoId] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
const [pickupOtp, setPickupOtp] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [riderId, setRiderId] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");

  const loadData = async (selectedCity = "") => {
  try {
    setLoading(true);
    setError("");

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

    if (vehicleData.success) {
      setVehicles(vehicleData.data || []);
    } else {
      throw new Error(vehicleData.message || "Unable to load vehicles.");
    }

    if (cityData.success) {
      setCities(cityData.data || []);
    } else {
      throw new Error(cityData.message || "Unable to load cities.");
    }

    if (hubData.success) {
      setHubs(hubData.data || []);
    } else {
      throw new Error(hubData.message || "Unable to load hubs.");
    }

    if ((cityData.data || []).length === 0) {
      setError("No cities available. Admin must add cities and active hubs first.");
    }
  } catch (loadError) {
    setError(
      loadError instanceof Error
        ? loadError.message
        : "Unable to load booking data. Please refresh."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  void loadData();
}, []);

useEffect(() => {
  if (!city) return;
  void loadData(city);
}, [city]);

 useEffect(() => {
  const loadRider = async (phone: string, token: string) => {
    try {
      const res = await fetch(`/api/riders?phone=${phone}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!data.success) return;

      const rider = data.data;

      setRiderName(rider.fullName || "");
      setRiderPhone(rider.phone || "");
      setRiderEmail(rider.email || "");
      setRiderId(rider.riderId || "");
    } catch (error) {
      console.error(error);
    }
  };

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user?.phoneNumber) {
      const token = await user.getIdToken();
      const phone = user.phoneNumber.replace(/\D/g, "").slice(-10);

      setFirebaseIdToken(token);
      localStorage.setItem("kebu_rider_phone", phone);
      await loadRider(phone, token);
      return;
    }

    setFirebaseIdToken("");
  });

  return () => unsubscribe();
}, []);

  const currentBike = vehicles.find((bike) => bike.vehicleId === selectedBike);

  const cityOptions = useMemo(() => {
  return cities
    .map((item) => item.cityName?.trim())
    .filter(Boolean);
}, [cities]);

const hubOptions = useMemo(() => hubs, [hubs]);

const filteredHubs = useMemo(() => {
  if (!city) return [];

  const selectedCity = normalizeText(city);

  return hubOptions.filter(
    (item) => normalizeText(item.city) === selectedCity
  );
}, [city, hubOptions]);

const selectedHubData = hubOptions.find(
  (item) => normalizeText(item.hubCode) === normalizeText(hub)
);

const selectedHubKeys = [
  selectedHubData?.hubCode,
  selectedHubData?.hubName,
  selectedHubData?.hubLocation,
  hub,
]
  .map(normalizeText)
  .filter(Boolean);

const hubValuesMatch = (bikeHub: string, hubKey: string) => {
  if (!bikeHub || !hubKey) return false;
  if (bikeHub === hubKey) return true;
  if (/^\d+$/.test(bikeHub) && /^\d+$/.test(hubKey)) {
    return Number(bikeHub) === Number(hubKey);
  }
  return bikeHub.includes(hubKey) || hubKey.includes(bikeHub);
};

const availableBikes = vehicles.filter((bike) => {
  const status = normalizeText(bike.vehicleStatus);
  return status === "available" || status === "";
});

const filteredBikes =
  selectedHubKeys.length === 0
    ? []
    : availableBikes
        .filter((bike) => {
          if (!bikeSearch.trim()) return true;

          const search = bikeSearch.toLowerCase();

          return (
            bike.vehicleId?.toLowerCase().includes(search) ||
            bike.registrationNumber?.toLowerCase().includes(search)
          );
        })
        .sort(
          (a, b) =>
            amount(b.batteryPercentage) -
            amount(a.batteryPercentage)
        );
const getPlanRate = (bike: Vehicle | undefined, mode: string) => {
  if (mode === "Hourly") return catalogRate("Hourly", bike?.hourlyRate);
  if (mode === "Daily") return catalogRate("Daily", bike?.dailyRate);
  if (mode === "Weekly") return catalogRate("Weekly", bike?.weeklyRate);
  return catalogRate("Monthly", bike?.monthlyRate);
};

const rentalAmount = getPlanRate(currentBike, rentalMode);
const tax = gstBreakdown(rentalAmount);
const securityDeposit = amount(currentBike?.securityDeposit) || COMPANY_SECURITY_DEPOSIT;
const payableAmount = tax.totalWithGst + securityDeposit;
const amountDue = bookingDone ? pendingAmount : payableAmount;

  useEffect(() => {
    if (payableAmount > 0 && !bookingDone) {
      setPaymentAmount(String(payableAmount));
    }
  }, [payableAmount, bookingDone]);

  const goToBikeStep = async () => {
  const validName = cleanName(riderName);
  const validPhone = normalizeIndianPhone(riderPhone);

  if (!nameRegex.test(validName)) {
    setError("Enter a valid rider name.");
    return;
  }

  if (!phoneRegex.test(validPhone)) {
    setError("Enter a valid 10 digit Indian mobile number.");
    return;
  }

  if (!city || !hub) {
    setError("Select pickup city and pickup hub.");
    return;
  }

  try {
    const user = auth.currentUser;

    if (!user) {
      setError("Please verify your phone number before booking.");
      return;
    }

    const token = await user.getIdToken();
    setFirebaseIdToken(token);

    const res = await fetch(`/api/riders?phone=${validPhone}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
const data = await res.json();

if (!data.success) {
  setError("Unable to verify your account.");
  return;
}

if (
  !data.data.phoneVerified ||
  data.data.approvalStatus !== "Approved" ||
  data.data.kycStatus !== "Approved" ||
  data.data.blacklisted
) {
  setError(
    "Your KYC or account has not been approved yet. Please wait for admin approval."
  );
  return;
}

setRiderName(validName);
setRiderPhone(validPhone);

setError("");
setStep(2);
  } catch {
    setError("Unable to verify your account.");
  }
};

  const goToReserveStep = () => {
    if (!currentBike) {
      setError("Select an available bike.");
      return;
    }

    if (rentalAmount <= 0) {
      setError("Selected rental plan does not have a valid price.");
      return;
    }

    setError("");
    setStep(3);
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createBooking = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentBike) {
      setError("Select an available bike.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const user = auth.currentUser;
      const token = firebaseIdToken || (await user?.getIdToken());

      if (!token) {
        setError("Please verify your phone number before booking.");
        return;
      }

      const normalizedPhone =
        normalizeIndianPhone(riderPhone) ||
        normalizeIndianPhone(user?.phoneNumber || "");

      if (!phoneRegex.test(normalizedPhone)) {
        setError("Enter a valid 10 digit Indian mobile number.");
        return;
      }

      if (!riderId) {
        setError("Rider profile not loaded. Please refresh and try again.");
        return;
      }

      setFirebaseIdToken(token);
      setRiderPhone(normalizedPhone);

      const newBookingId = "BK-" + Date.now();

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: newBookingId,
          userName: riderName,
          userPhone: normalizedPhone,
          riderId,
          vehicleId: currentBike.vehicleId,
startHub: selectedHubData?.hubCode || currentBike.currentHub || hub,
pickupHubName:
  selectedHubData?.hubName ||
  selectedHubData?.hubLocation ||
  hub,
hubAliases: [
  selectedHubData?.hubName,
  selectedHubData?.hubCode,
  selectedHubData?.hubLocation,
  currentBike.currentHub,
  hub,
].filter(Boolean),
city,
pickupCity: city,
rentalMode,
referenceBy,
          firebaseIdToken: token,
          paymentMode: "Razorpay",
          paymentStatus: "Pending",
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingData.success) {
  setError(
    bookingData.errors?.join(" ") ||
      bookingData.details ||
      bookingData.message ||
      "Booking failed."
  );
  return;
}

      setBookingId(newBookingId);
      setBookingMongoId(bookingData.data._id);
      setPendingAmount(Number(bookingData.data.pendingAmount || payableAmount));
      setPaymentAmount(String(bookingData.data.pendingAmount || payableAmount));
      setBookingDone(true);
setMessage("🎉 Your scooter has been reserved successfully. Complete the secure payment below to confirm your booking.");
setStep(4);
await loadData();
    } catch (error) {
  console.error("CREATE BOOKING ERROR:", error);
  setError("Booking failed. Please check your connection and try again.");
} finally {
      setSaving(false);
    }
  };

  const payWithRazorpay = async () => {
    setError("");
    setPaymentMessage("");
    setPaymentLoading(true);

    if (!bookingMongoId) {
      setError("Reserve Scooter first.");
      setPaymentLoading(false);
      return;
    }

    const payNow = Number(paymentAmount || amountDue);

    if (!Number.isFinite(payNow) || payNow < 1 || payNow > amountDue) {
      setError(`Enter a payment amount between INR 1 and ${formatINR(amountDue)}.`);
      setPaymentLoading(false);
      return;
    }

    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      setError("Razorpay failed to load. Check internet connection.");
      setPaymentLoading(false);
      return;
    }

    const user = auth.currentUser;
    const token = firebaseIdToken || (await user?.getIdToken());

    if (!token) {
      setError("Please verify your phone number before payment.");
      setPaymentLoading(false);
      return;
    }

    setFirebaseIdToken(token);

    setPaymentMessage("Creating Razorpay order...");

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
      setPaymentMessage("");
      setError(orderData.message || "Unable to create Razorpay order.");
      setPaymentLoading(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "EVUDDY",
      description: `Booking Payment - ${bookingId}`,
      order_id: orderData.orderId,
      prefill: {
        name: riderName,
        contact: riderPhone,
      },
      notes: {
        bookingId,
        vehicleId: selectedBike,
      },
      theme: {
  color: "#18B368",
},
      handler: async (response) => {
        setPaymentMessage("Verifying payment...");

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
          setPaymentMessage("");
          setError(verifyData.message || "Payment verification failed.");
          setPaymentLoading(false);
          return;
        }

        setPaidAmount((oldAmount) => Number((oldAmount + payNow).toFixed(2)));
        setPendingAmount(Number(verifyData.pendingAmount ?? verifyData.data?.pendingAmount ?? 0));

        if (Number(verifyData.pendingAmount ?? verifyData.data?.pendingAmount ?? 0) > 0) {
  setPaymentMessage(
    `Partial payment received. Pending: ${formatINR(Number(verifyData.pendingAmount ?? verifyData.data?.pendingAmount ?? 0))}`
  );

  setPaymentAmount(String(verifyData.pendingAmount ?? verifyData.data?.pendingAmount ?? 0));

  setPaymentLoading(false);
} else {
  setPaymentSuccess(true);

  if (verifyData.pickupOTP) {
    setPickupOtp(String(verifyData.pickupOTP));
  }

  setPaymentMessage(
    verifyData.pickupOTP
      ? `Payment successful. Your pickup OTP is ${verifyData.pickupOTP}.`
      : "Payment successful. Booking confirmed."
  );

  setPaymentLoading(false);
}
      },
      modal: {
  ondismiss: () => {
    setPaymentLoading(false);
    setPaymentMessage("Payment cancelled. You can try again.");
  },
},
    });

    razorpay.open();
  };

  return (
    <section
className="
relative
overflow-hidden
bg-gradient-to-br
from-[#F6FFF9]
via-white
to-[#F3FFF8]
py-10
md:py-28
"
>

<div
className="
absolute
-top-44
-left-44
h-[34rem]
w-[34rem]
rounded-full
bg-[#18B368]/12
blur-[140px]
"
/>

<div
className="
absolute
-bottom-44
-right-44
h-[34rem]
w-[34rem]
rounded-full
bg-[#22C55E]/10
blur-[140px]
"
/>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center">

<div
className="
inline-flex
items-center
gap-3
rounded-full
border
border-[#18B368]/20
bg-white
px-6
py-3
shadow-[0_10px_35px_rgba(15,23,42,.08)]
"
>

<div className="h-3 w-3 rounded-full bg-[#18B368] animate-pulse" />

<span
className="
text-sm
font-bold
tracking-[0.12em]
sm:tracking-[0.18em]
uppercase
text-[#18B368]
"
>

EVUDDY ELECTRIC MOBILITY

</span>

</div>

<h1
className="
mt-8
text-3xl
sm:text-5xl
md:text-7xl
font-black
leading-[1.05]
tracking-[-0.04em]
text-[#0F172A]
"
>

Book Your

<br />

<span
className="
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
bg-clip-text
text-transparent
"
>

Electric Ride

</span>

</h1>

<p
className="
mx-auto
mt-8
max-w-3xl
text-[16px]
leading-8
sm:text-[19px]
sm:leading-9
text-slate-600
"
>

Reserve your EV in minutes, choose the nearest pickup hub,

complete secure payment and start riding with India's next-generation

electric mobility platform.

</p>

<div
className="
mt-10
flex
flex-wrap
justify-center
gap-4
"
>

<div className="rounded-full bg-white px-5 py-3 shadow font-semibold text-[#16A34A]">

⚡ Instant Booking

</div>

<div className="rounded-full bg-white px-5 py-3 shadow font-semibold text-[#16A34A]">

🔋 Fully Charged Fleet

</div>

<div className="rounded-full bg-white px-5 py-3 shadow font-semibold text-[#16A34A]">

🛡 Secure Payments

</div>

<div className="rounded-full bg-white px-5 py-3 shadow font-semibold text-[#16A34A]">

📍 Smart Pickup Hubs

</div>

</div>

</div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 font-semibold text-green-700">
            {message}
          </div>
        )}

        <div className="mb-14">

  <div className="overflow-x-auto">
  <div className="flex min-w-[700px] items-center justify-between">

    {[
      {
        title: "Details",
        icon: "👤",
      },
      {
        title: "Vehicle",
        icon: "🛵",
      },
      {
        title: "Reserve",
        icon: "📋",
      },
      {
        title: "Payment",
        icon: "💳",
      },
    ].map((item, index) => {

      const active = step >= index + 1;

      return (

        <div
          key={item.title}
          className="flex flex-1 items-center"
        >

          <div className="flex flex-col items-center">

            <div
              className={`
w-14
h-14
rounded-full
flex
items-center
justify-center
text-2xl
transition-all
duration-500
shadow-lg
${
active
? "bg-gradient-to-br from-[#16A34A] to-[#18B368] text-white scale-110"
: "bg-white border border-slate-200 text-slate-500"
}
`}
            >

              {active ? "✓" : item.icon}

            </div>

            <h3
              className={`
mt-4
text-[15px]
font-bold
transition-all
duration-300
${
active
? "text-[#16A34A]"
: "text-slate-500"
}
`}
            >

              {item.title}

            </h3>

          </div>

          {index !== 3 && (

            <div
              className={`
mx-4
mb-8
h-[4px]
flex-1
rounded-full
transition-all
duration-500
${
step > index + 1
? "bg-gradient-to-r from-[#16A34A] to-[#22C55E]"
: "bg-slate-200"
}
`}
            />

          )}

        </div>

      );

    })}

  </div>

</div>
</div>
          
<div className="grid gap-10 lg:grid-cols-[1.38fr_0.62fr]">
          <form
            onSubmit={createBooking}
            className="rounded-[36px] border border-white bg-white/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,.12)] backdrop-blur-xl md:p-10"
          >
            <div className="mb-6 rounded-[24px] border border-[#18B368]/15 bg-[#F7FBF8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Rental prices</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Hourly {formatINR(CATALOG_RATES.Hourly)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Daily {formatINR(CATALOG_RATES.Daily)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Weekly {formatINR(CATALOG_RATES.Weekly)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Monthly {formatINR(CATALOG_RATES.Monthly)}</span>
              </div>
              <Link
                href="/rent-to-own"
                className="mt-3 flex items-center justify-between rounded-2xl bg-[#0B1B16] px-4 py-3 text-white"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-[#6EE7A8]">Own the scooter</span>
                  <span className="font-bold">Rent to Own {formatINR(RTO_PLAN.dailyRate)}/day · {RTO_PLAN.tenureMonths} months</span>
                </span>
                <span className="text-sm font-semibold">Open →</span>
              </Link>
            </div>
            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Rider Name *">
                  <input
disabled={!!riderName}
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
disabled:bg-slate-100
disabled:text-slate-500
disabled:cursor-not-allowed
"
                    placeholder="Full name"
                  />
                </Field>

                <Field label="Phone Number *">
                  <input
disabled={!!riderPhone}
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(cleanDigits(e.target.value).slice(0, 10))}
                    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
disabled:bg-slate-100
disabled:text-slate-500
disabled:cursor-not-allowed
"
                    placeholder="10 digit mobile"
                  />
                </Field>

                <Field label="Email">
  <input
    value={riderEmail}
    disabled
    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
disabled:bg-slate-100
disabled:text-slate-500
disabled:cursor-not-allowed
"
  />
</Field>

<Field label="Rider ID">
  <input
    value={riderId}
    disabled
    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
disabled:bg-slate-100
disabled:text-slate-500
disabled:cursor-not-allowed
"
  />
</Field>

                <Field label="Pickup City *">
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setHub("");
                      setSelectedBike("");
                    }}
                    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
cursor-pointer
"
                  >
                    <option value="">Select city</option>
                    {cityOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Pickup Hub *">
                  <select
  value={hub}
  disabled={!city}
  onChange={(e) => {
    setHub(e.target.value);
    setSelectedBike("");
  }}
  className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
disabled:bg-slate-100
disabled:text-slate-400
cursor-pointer
"
>
  <option value="">{city ? "Select hub" : "Select city first"}</option>
  {filteredHubs.map((item, index) => (
  <option key={item._id || index} value={item.hubCode}>
    {item.hubName} ({item.hubCode})
  </option>
))}
</select>
                </Field>

                <Field label="Employee Reference">
                  <input
                    value={referenceBy}
                    onChange={(e) => setReferenceBy(e.target.value)}
                   className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
"
                    placeholder="Optional"
                  />
                </Field>

                

                <div className="flex items-end">
                  <button
  type="button"
  onClick={goToBikeStep}
  className="
w-full
h-16
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
font-bold
tracking-wide
text-white
shadow-[0_18px_45px_rgba(24,179,104,.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_26px_60px_rgba(24,179,104,.45)]
active:scale-[0.98]
"
>
  Continue →
</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
               <div className="mt-6 mb-6">
  <input
    type="text"
    placeholder="Search by Vehicle ID or Registration Number..."
    value={bikeSearch}
    onChange={(e) => setBikeSearch(e.target.value)}
    className="
h-16
w-full
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
px-5
text-[15px]
font-medium
text-[#0F172A]
placeholder:text-slate-400
outline-none
transition-all
duration-300
shadow-sm
hover:border-[#22C55E]/40
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/10
"
  />
</div>

                <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["Hourly", "Daily", "Weekly", "Monthly"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRentalMode(item)}
                      className={`min-h-16 rounded-2xl border px-2 py-2 font-bold ${
                        rentalMode === item
? "border-[#18B368] bg-gradient-to-r from-[#16A34A] to-[#18B368] text-white shadow-lg"
: "border-slate-200 bg-white text-slate-700 hover:border-[#22C55E]/40"
                      }`}
                    >
                      <span className="block text-sm sm:text-base">{item}</span>
                      <span className={`block text-xs font-semibold ${rentalMode === item ? "text-white/90" : "text-slate-500"}`}>
                        {formatINR(CATALOG_RATES[item])}
                      </span>
                    </button>
                  ))}
                </div>

                <Link
                  href="/rent-to-own"
                  className="mb-5 flex min-h-16 items-center justify-between rounded-2xl border border-[#18B368]/30 bg-[#0B1B16] px-4 py-3 text-white"
                >
                  <span>
                    <span className="block text-sm font-bold">Rent to Own</span>
                    <span className="text-xs text-white/70">{formatINR(RTO_PLAN.dailyRate)} per day for {RTO_PLAN.tenureMonths} months, then the scooter is yours</span>
                  </span>
                  <span className="text-sm font-bold text-[#6EE7A8]">Choose →</span>
                </Link>

                   {loading ? (
  <Empty text="Loading available scooters..." />
) : !hub ? (
  <Empty text="Choose your pickup hub to view available scooters." />
) : filteredBikes.length === 0 ? (
  <Empty text="No scooters are marked Available right now. Ask admin to set bikes to Available." />
) : (              
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 ">
                    {filteredBikes.map((bike) => {
                      const isSelected = selectedBike === bike.vehicleId;
                      const price = getPlanRate(bike, rentalMode);

                      return (
                        <button
                          key={bike._id}
                          type="button"
                          onClick={() => setSelectedBike(bike.vehicleId)}
                          className={`
group
relative
overflow-hidden
rounded-[32px]
border
bg-white
p-6
text-left
transition-all
duration-500
hover:-translate-y-2
hover:shadow-[0_30px_70px_rgba(15,23,42,.12)]
${
isSelected
? "border-[#18B368] shadow-[0_25px_60px_rgba(24,179,104,.20)] ring-2 ring-[#18B368]/10"
: "border-slate-200 hover:border-[#18B368]/40"
}
`}
                        >
                          <div
className="
absolute
top-0
left-0
w-full
h-1
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
opacity-0
group-hover:opacity-100
transition-all
duration-500
"
/>
                          <div className="flex justify-between gap-3">
                            <h4
className="
text-[28px]
font-black
tracking-[-0.03em]
text-[#0F172A]
"
>{bike.vehicleId}</h4>
                            {isSelected && (

<div
className="
rounded-full
bg-[#18B368]
p-2
shadow-lg
"
>

<CheckCircle2
size={20}
className="text-white"
/>

</div>

)}
                          </div>
                          <p
className="
mt-2
text-[15px]
font-medium
text-slate-500
"
>{bike.vehicleModel || "Electric Scooter"}</p>
                          <p
className="
mt-1
text-[13px]
font-semibold
uppercase
tracking-[0.08em]
text-slate-400
"
>
    {bike.registrationNumber}
</p>
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <div>

<div className="flex justify-between mb-2">
<span>Battery </span>

<span
className="
text-[15px]
font-black
text-[#16A34A]
"
>
{amount(bike.batteryPercentage)}%
</span>

</div>

<div
className="
h-3
overflow-hidden
rounded-full
bg-slate-200
shadow-inner
"
>

<div
  className={`h-full rounded-full transition-all duration-700 ${
    amount(bike.batteryPercentage) >= 70
      ? "bg-green-500"
      : amount(bike.batteryPercentage) >= 40
      ? "bg-yellow-500"
      : "bg-red-500"
  }`}
  style={{
    width: `${amount(bike.batteryPercentage)}%`,
  }}
/>

</div>

</div>
                            <div className="flex items-center justify-between">
    <span>Battery Type</span>

    <span className="font-bold text-[#0A1134]">
        {bike.batteryType || "Chargeable"}
    </span>
</div>
                            <div
className="
mt-5
rounded-[24px]
border
border-[#18B368]/10
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-5
"
>

    <p className="text-xs uppercase tracking-wide text-gray-500">
        {rentalMode} Rent
    </p>

    <p
className="
mt-2
text-[34px]
font-black
tracking-[-0.03em]
text-[#16A34A]
"
>
        {formatINR(price)}
    </p>

</div>
<p
className="
mt-5
inline-flex
items-center
rounded-full
bg-slate-100
px-4
py-2
text-[13px]
font-semibold
text-slate-600
"
>
  📍 {bike.currentHub}
</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <StepButtons onBack={() => setStep(1)} onNext={goToReserveStep} nextText="Continue" />
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-8">

<div className="inline-flex items-center gap-3 rounded-full bg-[#F4FFF8] px-5 py-2">

<div className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

<span
className="
text-sm
font-bold
uppercase
tracking-[0.15em]
text-[#18B368]
"
>

BOOKING REVIEW

</span>

</div>

<h2
className="
mt-5
text-3xl
sm:text-4xl
font-black
tracking-[-0.03em]
text-[#0F172A]
"
>

Review Your Booking

</h2>

<p
className="
mt-3
text-[17px]
leading-8
text-slate-500
max-w-2xl
"
>

Verify all booking details before reserving your EVUDDY scooter.

</p>

</div>

                <div
className="
mt-8
rounded-[30px]
border
border-[#18B368]/10
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-7
shadow-[0_15px_40px_rgba(24,179,104,.08)]
"
>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">

TOTAL PAYABLE

</p>

<p
className="
mt-3
text-3xl
sm:text-[42px]
font-black
tracking-[-0.03em]
text-[#16A34A]
"
>

{formatINR(payableAmount)}

</p>

<p className="mt-3 text-slate-500">

Includes CGST 2.5% + SGST 2.5% on rental, plus a refundable security deposit of

<strong className="text-[#16A34A]">

{" "}
{formatINR(securityDeposit)}

</strong>

</p>
                </div>

                <div
className="
mt-8
rounded-[32px]
border
border-slate-200
bg-white
p-8
shadow-[0_25px_70px_rgba(15,23,42,.08)]
"
>

  <h3
className="
mb-8
text-[30px]
font-black
tracking-[-0.03em]
text-[#0F172A]
"
>
    Booking Review
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <Summary label="Rider Name" value={riderName} />

    <Summary label="Rider ID" value={riderId || "-"} />

    <Summary label="Vehicle ID" value={selectedBike} />

    <Summary
      label="Vehicle Model"
      value={currentBike?.vehicleModel || "-"}
    />

    <Summary
      label="Registration"
      value={currentBike?.registrationNumber || "-"}
    />

    <Summary label="Pickup City" value={city} />

    <Summary
  label="Pickup Hub"
  value={
    selectedHubData?.hubName
      ? `${selectedHubData.hubName} (${hub})`
      : hub
  }
/>

    <Summary label="Rental Mode" value={rentalMode} />

    <Summary
      label="Rental Amount"
      value={formatINR(rentalAmount)}
    />

    <Summary
      label="CGST 2.5%"
      value={formatINR(tax.cgstAmount)}
    />

    <Summary
      label="SGST 2.5%"
      value={formatINR(tax.sgstAmount)}
    />

    <Summary
      label="GST Total (5%)"
      value={formatINR(tax.gstAmount)}
    />

    <Summary
      label="Security Deposit"
      value={formatINR(securityDeposit)}
    />

    <Summary
      label="Total Payable"
      value={formatINR(payableAmount)}
      strong
    />

  </div>

</div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="
flex-1
h-16
rounded-2xl
border
border-slate-300
bg-white
font-bold
text-slate-700
transition-all
duration-300
hover:border-[#18B368]
hover:text-[#18B368]
hover:-translate-y-1
"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={bookingDone || saving}
                    className="
flex
h-16
flex-1
items-center
justify-center
gap-3
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
font-bold
tracking-wide
text-white
shadow-[0_18px_45px_rgba(24,179,104,.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_24px_60px_rgba(24,179,104,.45)]
disabled:opacity-60
"
                  >
                    <ShieldCheck size={18} />
                    {saving ? "Reserving..." : bookingDone ? "Reserved" : "Reserve Scooter"}
                  </button>
                </div>

                {bookingDone && (
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="
mt-5
h-16
w-full
rounded-2xl
bg-[#0F172A]
font-bold
tracking-wide
text-white
transition-all
duration-300
hover:bg-black
hover:-translate-y-1
"
                  >
                    Go To Payment
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-8">

<div className="inline-flex items-center gap-3 rounded-full bg-[#F4FFF8] px-5 py-2">

<div className="h-2.5 w-2.5 rounded-full bg-[#18B368]" />

<span
className="
text-sm
font-bold
uppercase
tracking-[0.15em]
text-[#18B368]
"
>

SECURE PAYMENT

</span>

</div>

<h2
className="
mt-5
text-4xl
font-black
tracking-[-0.03em]
text-[#0F172A]
"
>

Complete Your Payment

</h2>

<p
className="
mt-3
max-w-2xl
text-[17px]
leading-8
text-slate-500
"
>

Your scooter has been reserved successfully. Complete the payment securely to confirm your EVUDDY booking.

</p>

</div>

<div
className="
mt-8
rounded-[32px]
border
border-[#18B368]/10
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-7
shadow-[0_15px_40px_rgba(24,179,104,.08)]
"
>

<p
className="
text-xs
font-bold
tracking-[0.16em]
uppercase
text-slate-500
"
>

PAYMENT AMOUNT

</p>
<p className="mt-2 text-sm text-slate-500">
Pay the full total or a smaller amount. Remaining pending updates here and on admin dashboards.
</p>
<input
  type="number"
  value={paymentAmount}
  disabled={!bookingDone || paymentSuccess}
  onChange={(e) => setPaymentAmount(e.target.value)}
  className="
mt-4
h-16
w-full
rounded-2xl
border
border-slate-200
bg-white
px-6
text-[22px]
font-black
text-[#16A34A]
outline-none
transition-all
duration-300
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
"
  placeholder="Pay now amount"
/>

</div>
                 
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
  <AmountBox
    label="Total"
    value={formatINR(payableAmount)}
    tone="green"
  />
  <AmountBox
    label="Paid"
    value={formatINR(paidAmount)}
    tone="green"
  />

  <AmountBox
    label="Pending"
    value={formatINR(pendingAmount || payableAmount - paidAmount)}
    tone="amber"
  />
</div>

                <button
                  type="button"
                  disabled={
   !bookingDone ||
   paymentSuccess ||
   amountDue <= 0 ||
   paymentLoading
}
                  onClick={payWithRazorpay}
                  className="
mt-7
flex
h-16
w-full
items-center
justify-center
gap-3
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
font-bold
tracking-wide
text-white
shadow-[0_22px_55px_rgba(24,179,104,.35)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_28px_70px_rgba(24,179,104,.45)]
disabled:opacity-60
"
                >
                  <CreditCard size={18} />

{paymentLoading
 ? "Processing..."
 : "Pay Securely with Razorpay"}
                </button>

                {paymentMessage && (

<div
className="
mt-7
rounded-[30px]
border
border-sky-200
bg-gradient-to-br
from-sky-50
to-white
p-6
"
>

<p className="font-bold text-blue-700">
Payment Status
</p>

<p className="mt-2 text-sm text-gray-700">
{paymentMessage}
</p>

</div>

)}

{paymentSuccess && (

<div
className="
mt-10
rounded-[36px]
border
border-[#18B368]/20
bg-gradient-to-br
from-[#F6FFF9]
via-white
to-[#F1FFF7]
p-10
shadow-[0_35px_90px_rgba(24,179,104,.15)]
"
>

<div className="text-center">

<div className="text-7xl mb-5">
✅
</div>

<h2 className="
text-5xl
font-black
tracking-[-0.03em]
text-[#16A34A]
">
Booking Confirmed
</h2>

<p className="mt-3 text-gray-600">
Payment completed successfully.
Your scooter has been reserved.
</p>

{pickupOtp && (
  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
    <p className="text-sm font-semibold text-green-800">
      Pickup OTP
    </p>
    <p className="mt-2 text-4xl font-black tracking-[0.3em] text-green-700">
      {pickupOtp}
    </p>
    <p className="mt-2 text-sm text-green-700">
      Show this OTP at the hub to collect your scooter.
    </p>
  </div>
)}

</div>

<div className="mt-8 space-y-3">

<Summary
label="Booking ID"
value={bookingId}
/>

<Summary
label="Rider ID"
value={riderId}
/>

<Summary
label="Vehicle ID"
value={selectedBike}
/>

<Summary
label="Vehicle Model"
value={currentBike?.vehicleModel || "-"}
/>

<Summary
label="Registration Number"
value={currentBike?.registrationNumber || "-"}
/>

<Summary
label="Pickup City"
value={city}
/>

<Summary
label="Pickup Hub"
value={hub}
/>

<Summary
label="Rental Mode"
value={rentalMode}
/>

</div>

<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

<AmountBox
label="Paid"
value={formatINR(paidAmount)}
tone="green"
/>

<AmountBox
label="Pending"
value={formatINR(0)}
tone="green"
/>

</div>

<div className="mt-8 rounded-2xl border border-green-200 bg-green-100 p-5">

<p className="font-bold text-green-800">
Show this Booking ID while collecting your scooter from the selected hub.
</p>

</div>

</div>

)}
              </div>
            )}
          </form>

          <aside className="space-y-6 lg:sticky lg:top-24 xl:top-28 self-start">
            <div
className="
rounded-[36px]
border
border-slate-200
bg-white/95
backdrop-blur-xl
p-8
shadow-[0_35px_90px_rgba(15,23,42,.10)]
"
>
              <div className="mb-5 flex items-center justify-between">
                <h2
className="
text-[32px]
font-black
tracking-[-0.03em]
text-[#0F172A]
"
>
    Booking Summary
</h2>

<p className="mt-1 text-sm text-gray-500">
    Review your reservation before completing payment.
</p>
                <ReceiptText className="text-[#18B368]" />
              </div>

              <div className="space-y-3 text-sm">
                <Summary label="Rider" value={riderName || "-"} />
                <Summary label="Phone" value={riderPhone || "-"} />
                <Summary label="City" value={city || "-"} />
                <Summary label="Hub" value={hub || "-"} />
                <Summary label="Bike" value={selectedBike || "-"} />
                <Summary
  label="Model"
  value={currentBike?.vehicleModel || "-"}
/>
<Summary
  label="Registration"
  value={currentBike?.registrationNumber || "-"}
/>
<Summary
  label="Battery"
  value={`${amount(currentBike?.batteryPercentage)}%`}
/>
                <Summary label="Rental" value={formatINR(rentalAmount)} />
                <Summary label="CGST 2.5%" value={formatINR(tax.cgstAmount)} />
                <Summary label="SGST 2.5%" value={formatINR(tax.sgstAmount)} />
                <Summary label="Deposit (no GST)" value={formatINR(securityDeposit)} />
                <Summary label="Grand Total" value={formatINR(payableAmount)} strong />
                <div
  className="
  flex
  items-center
  justify-between
  border-b
  border-slate-100
  py-4
  "
>
  <span
    className="
    text-[13px]
    font-semibold
    uppercase
    tracking-[0.08em]
    text-slate-500
    "
  >
    Payment
  </span>

  <span
    className={`
    rounded-full
    px-3
    py-1.5
    text-xs
    font-bold
    ${
      paymentSuccess
        ? "bg-green-100 text-green-700"
        : bookingDone
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600"
    }
    `}
  >
    {
      paymentSuccess
        ? "PAID"
        : bookingDone
        ? "PENDING"
        : "NOT STARTED"
    }
  </span>
</div>
              </div>

              {bookingId && (
  <div
className="
mt-8
rounded-[28px]
border
border-[#18B368]/10
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-6
"
>

    <p className="text-xs uppercase tracking-wide text-green-600">
      Booking Reference
    </p>

    <p className="mt-2 text-lg font-black text-green-700">
      {bookingId}
    </p>

  </div>
)}
            </div>

            {selectedHubData && (
              <div
className="
rounded-[32px]
border
border-[#18B368]/10
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-6
shadow-sm
"
>
                <div className="flex items-start gap-4">
                  <MapPin
size={26}
className="mt-1 text-[#18B368]"
/>
                  <div>
                    <h3 className="font-black text-[#0A1134]">{selectedHubData.hubName}</h3>
                    <p className="mt-1 text-sm text-gray-600">{selectedHubData.hubLocation}</p>
                    <p className="mt-3 text-sm text-gray-600">
  📍 {selectedHubData.hubLocation}
</p>

{selectedHubData.latitude && selectedHubData.longitude && (
  <a
    href={`https://www.google.com/maps?q=${selectedHubData.latitude},${selectedHubData.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="
mt-5
inline-flex
items-center
gap-2
rounded-full
bg-gradient-to-r
from-[#16A34A]
to-[#18B368]
px-6
py-3
text-sm
font-bold
text-white
transition-all
duration-300
hover:-translate-y-1
"
  >
    Open in Google Maps
  </a>
)}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label
        className="
mb-3
block
text-[13px]
font-semibold
uppercase
tracking-[0.12em]
text-slate-500
"
      >
        {label}
      </label>

      {children}

    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (

<div
className="
rounded-[30px]
border
border-dashed
border-[#18B368]/20
bg-gradient-to-br
from-[#F6FFF9]
to-white
p-12
text-center
"
>

<div className="mb-5 text-6xl">

🛵

</div>

<h3 className="text-2xl font-black text-[#0F172A]">

No Scooters Found

</h3>

<p className="mt-4 leading-7 text-slate-500">

{text}

</p>

</div>

  );
}

function StepButtons({    
  onBack,
  onNext,
  nextText,
}: {
  onBack: () => void;
  onNext: () => void;
  nextText: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onBack}
        className="
flex-1
h-16
rounded-2xl
border
border-slate-300
bg-white
font-bold
text-slate-700
transition-all
duration-300
hover:border-[#18B368]
hover:text-[#18B368]
hover:-translate-y-1
"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="
flex-1
h-16
rounded-2xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
font-bold
tracking-wide
text-white
shadow-[0_18px_45px_rgba(24,179,104,.30)]
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_25px_55px_rgba(24,179,104,.40)]
"
      >
        {nextText}
      </button>
    </div>
  );
}

function AmountBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber";
}) {
  const classes = tone === "green" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700";

  return (
    <div
className={`
rounded-[28px]
p-6
shadow-sm
border
${classes}
`}
>
      <p
className="
text-xs
uppercase
tracking-[0.12em]
font-bold
"
>{label}</p>
      <p
className="
mt-2
text-3xl
font-black
tracking-[-0.02em]
"
>{value}</p>
    </div>
  );
}

function Summary({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
className="
flex
items-center
justify-between
gap-4
border-b
border-slate-100
py-4
"
>
      <span
className="
text-[13px]
font-semibold
uppercase
tracking-[0.08em]
text-slate-500
"
>{label}</span>
      <span
className={
strong
? "text-lg font-black text-[#16A34A]"
: "font-semibold text-[#0F172A]"
}
>
        {value}
      </span>
    </div>
  );
}
