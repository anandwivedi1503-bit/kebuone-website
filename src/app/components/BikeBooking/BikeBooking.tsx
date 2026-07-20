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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [city, setCity] = useState("");
  const [hub, setHub] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [bikeSearch, setBikeSearch] = useState("");
  const [rentalMode, setRentalMode] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [referenceBy, setReferenceBy] = useState("");

  const [bookingId, setBookingId] = useState("");
  const [bookingMongoId, setBookingMongoId] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [riderId, setRiderId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

             const [vehicleRes, hubRes] = await Promise.all([
  fetch("/api/vehicles"),
  fetch("/api/hubs"),
]);

      const vehicleData = await vehicleRes.json();
      const hubData = await hubRes.json();
      

      if (vehicleData.success) setVehicles(vehicleData.data || []);
      if (hubData.success) setHubs(hubData.data || []);
    } catch {
      setError("Unable to load vehicles and hubs. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

 useEffect(() => {
  const loadRider = async (phone: string) => {
    try {
      const res = await fetch(`/api/riders?phone=${phone}`);
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
      await loadRider(user.phoneNumber.replace("+91", ""));
      return;
    }

    const savedPhone = localStorage.getItem("kebu_rider_phone");

    if (savedPhone) {
      await loadRider(savedPhone);
    }
  });

  return () => unsubscribe();
}, []);

  const currentBike = vehicles.find((bike) => bike.vehicleId === selectedBike);

  const cityOptions = useMemo(() => {
  const fromHubs = hubs
    .map((item) => item.city || item.hubLocation || "")
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(fromHubs));
}, [hubs]);

const hubOptions = useMemo(() => hubs, [hubs]);

const filteredHubs = useMemo(() => {
  if (!city) return [];

  return hubOptions.filter((item) => {
    const selectedCity = normalizeText(city);
    const hubCity = normalizeText(item.city || item.hubLocation);
    const hubName = normalizeText(item.hubName);

    return (
      hubCity === selectedCity ||
      hubCity.includes(selectedCity) ||
      hubName.includes(selectedCity)
    );
  });
}, [city, hubOptions]);

const selectedHubData = hubOptions.find(
  (item) => normalizeText(item.hubName) === normalizeText(hub)
);

const selectedHubKeys = [
  selectedHubData?.hubName,
  selectedHubData?.hubCode,
  selectedHubData?.hubLocation,
]
  .map(normalizeText)
  .filter(Boolean);

const filteredBikes =
  selectedHubKeys.length === 0
    ? []
    : vehicles
        .filter((bike) => {
          const bikeHub = normalizeText(bike.currentHub);

          return (
            normalizeText(bike.vehicleStatus) === "available" &&
            selectedHubKeys.some(
              (hub) => normalizeText(hub) === bikeHub
            )
          );
        })
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
const rentalAmount =
  rentalMode === "Daily"
    ? amount(currentBike?.dailyRate)
    : rentalMode === "Weekly"
    ? amount(currentBike?.weeklyRate)
    : amount(currentBike?.monthlyRate);

const securityDeposit = amount(currentBike?.securityDeposit) || COMPANY_SECURITY_DEPOSIT;
const payableAmount = rentalAmount + securityDeposit;
const amountDue = bookingDone ? pendingAmount : payableAmount;

  useEffect(() => {
    if (payableAmount > 0 && !bookingDone) {
      setPaymentAmount(String(payableAmount));
    }
  }, [payableAmount, bookingDone]);

  const goToBikeStep = async () => {
  const validName = cleanName(riderName);
  const validPhone = cleanDigits(riderPhone).slice(0, 10);

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
    const res = await fetch(`/api/riders?phone=${validPhone}`);
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

      const newBookingId = "BK-" + Date.now();

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: newBookingId,
          userName: riderName,
          userPhone: riderPhone,
          riderId,
          vehicleId: currentBike.vehicleId,
startHub: currentBike.currentHub || hub,
pickupHubName: hub,
hubAliases: [
  hub,
  selectedHubData?.hubName,
  selectedHubData?.hubCode,
  selectedHubData?.hubLocation,
  currentBike.currentHub,
].filter(Boolean),
city,
rentalMode,
referenceBy,
          paymentMode: "Razorpay",
          paymentStatus: "Pending",
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingData.success) {
        setError(bookingData.errors?.join(" ") || bookingData.message || "Booking failed.");
        return;
      }

      setBookingId(newBookingId);
      setBookingMongoId(bookingData.data._id);
      setPendingAmount(Number(bookingData.data.pendingAmount || payableAmount));
      setPaymentAmount(String(bookingData.data.pendingAmount || payableAmount));
      setBookingDone(true);
      setMessage("🎉 Your scooter has been reserved successfully. Complete the secure payment below to confirm your booking.");
      await loadData();
    } catch {
      setError("Booking failed. Please try again.");
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

    setPaymentMessage("Creating Razorpay order...");

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingMongoId,
        amount: payNow,
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
      name: "Kebu One",
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
        color: "#FF165E",
      },
      handler: async (response) => {
        setPaymentMessage("Verifying payment...");

        const verifyRes = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
          setPaymentMessage("");
          setError(verifyData.message || "Payment verification failed.");
          setPaymentLoading(false);
          return;
        }

        setPaidAmount((oldAmount) => Number((oldAmount + payNow).toFixed(2)));
        setPendingAmount(Number(verifyData.pendingAmount || 0));

        if (Number(verifyData.pendingAmount || 0) > 0) {
  setPaymentMessage(
    `Partial payment received. Pending: ${formatINR(Number(verifyData.pendingAmount))}`
  );

  setPaymentAmount(String(verifyData.pendingAmount));

  setPaymentLoading(false);
} else {
  setPaymentSuccess(true);

  setPaymentMessage("Payment successful. Booking confirmed.");

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF5F8] via-white to-[#F4F7FF] py-12 md:py-20">

<div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />

<div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-blue-200/20 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-bold text-[#FF165E]">
            <Bike size={16} />
            Bike Booking
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-[#0A1134] md:text-7xl">
    Ride Smarter
</h1>

<h2 className="mt-2 text-2xl sm:text-3xl  font-black text-[#FF165E] md:text-5xl">
    Reserve Your Electric Scooter
</h2>

<p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
    Choose your pickup hub, select an available scooter, reserve it instantly,
    and complete a secure payment through Razorpay.
</p>
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

        <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3 rounded-3xl bg-white p-4 shadow-lg">
          {["Details", "Bike", "Reserve", "Payment"].map((label, index) => (
            <div
              key={label}
              className={`rounded-2xl border py-4 transition-all duration-300 ${
                step >= index + 1
                  ? "border-[#FF165E] bg-pink-50 text-[#FF165E]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <form
            onSubmit={createBooking}
            className="
rounded-[32px]
bg-white/95
backdrop-blur-xl
border
border-white
p-6
md:p-10
shadow-[0_30px_100px_rgba(10,17,52,0.10)]
"
          >
            {step === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Rider Name *">
                  <input
disabled={!!riderName}
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-[#FF165E] disabled:cursor-not-allowed"
                    placeholder="Full name"
                  />
                </Field>

                <Field label="Phone Number *">
                  <input
disabled={!!riderPhone}
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(cleanDigits(e.target.value).slice(0, 10))}
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none focus:border-[#FF165E] disabled:cursor-not-allowed"
                    placeholder="10 digit mobile"
                  />
                </Field>

                <Field label="Email">
  <input
    value={riderEmail}
    disabled
    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none disabled:cursor-not-allowed"
  />
</Field>

<Field label="Rider ID">
  <input
    value={riderId}
    disabled
    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none disabled:cursor-not-allowed"
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
                    className="h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
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
  className="h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-[#FF165E] disabled:bg-gray-50 disabled:text-gray-400"
>
  <option value="">{city ? "Select hub" : "Select city first"}</option>
  {filteredHubs.map((item, index) => (
    <option key={item._id || index} value={item.hubName}>
      {item.hubName}
    </option>
  ))}
</select>
                </Field>

                <Field label="Employee Reference">
                  <input
                    value={referenceBy}
                    onChange={(e) => setReferenceBy(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
                    placeholder="Optional"
                  />
                </Field>

                

                <div className="flex items-end">
                  <button
  type="button"
  onClick={goToBikeStep}
  className="h-14 w-full rounded-2xl bg-[#FF165E] font-black text-white"
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
      h-14
      w-full
      rounded-2xl
      border
      border-gray-200
      px-5
      outline-none
      focus:border-[#FF165E]
      focus:ring-4
      focus:ring-pink-100
    "
  />
</div>

                <div className="mb-5 grid grid-cols-3 gap-2">
                  {["Daily", "Weekly", "Monthly"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRentalMode(item as "Daily" | "Weekly" | "Monthly")}
                      className={`h-14 rounded-2xl border font-bold ${
                        rentalMode === item
                          ? "border-[#FF165E] bg-pink-50 text-[#FF165E]"
                          : "border-gray-200 text-[#0A1134]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                   {loading ? (
  <Empty text="Loading available scooters..." />
) : !hub ? (
  <Empty text="Choose your pickup hub to view available scooters." />
) : filteredBikes.length === 0 ? (
  <Empty text="No available scooters found for this hub. In Vehicle Management, keep vehicleStatus as Available and currentHub equal to this hub name or hub code." />
) : (              
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredBikes.map((bike) => {
                      const isSelected = selectedBike === bike.vehicleId;
                      const price =
                        rentalMode === "Daily"
                          ? amount(bike.dailyRate)
                          : rentalMode === "Weekly"
                          ? amount(bike.weeklyRate)
                          : amount(bike.monthlyRate);

                      return (
                        <button
                          key={bike._id}
                          type="button"
                          onClick={() => setSelectedBike(bike.vehicleId)}
                          className={`group rounded-[30px] border-2 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                            isSelected ? "border-[#FF165E] shadow-2xl scale-[1.02]" : "border-gray-100 hover:border-pink-200"
                          }`}
                        >
                          <div className="flex justify-between gap-3">
                            <h4 className="text-2xl font-black text-[#0A1134]">{bike.vehicleId}</h4>
                            {isSelected && <CheckCircle2 className="text-[#FF165E]" />}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{bike.vehicleModel || "Electric Scooter"}</p>
                          <p className="mt-1 text-sm font-medium text-gray-500">
    {bike.registrationNumber}
</p>
                          <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <div>

<div className="flex justify-between mb-2">
<span>Battery </span>

<span className="font-bold">
{amount(bike.batteryPercentage)}%
</span>

</div>

<div className="h-3 rounded-full bg-gray-200 overflow-hidden">

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
                            <div className="mt-4 rounded-2xl bg-pink-50 p-3">

    <p className="text-xs uppercase tracking-wide text-gray-500">
        {rentalMode} Rent
    </p>

    <p className="mt-1 text-2xl font-black text-[#FF165E]">
        {formatINR(price)}
    </p>

</div>
<p className="mt-4 text-sm text-gray-500">
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
                <h2 className="text-2xl font-black text-[#0A1134]">Reserve Scooter</h2>
                <p className="mt-2 text-gray-600">Review your booking and reserve the scooter before payment.</p>

                <div className="mt-6 rounded-3xl bg-pink-50 p-5 text-sm font-semibold text-[#0A1134]">
                  Total payable: {formatINR(payableAmount)} including {formatINR(securityDeposit)} deposit.
                </div>

                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

  <h3 className="mb-5 text-xl font-black text-[#0A1134]">
    Booking Review
  </h3>

  <div className="grid gap-4 md:grid-cols-2">

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

    <Summary label="Pickup Hub" value={hub} />

    <Summary label="Rental Mode" value={rentalMode} />

    <Summary
      label="Rental Amount"
      value={formatINR(rentalAmount)}
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
                    className="h-14 flex-1 rounded-2xl border border-gray-200 font-bold"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={bookingDone || saving}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF165E] font-black text-white disabled:opacity-60"
                  >
                    <ShieldCheck size={18} />
                    {saving ? "Reserving..." : bookingDone ? "Reserved" : "Reserve Scooter"}
                  </button>
                </div>

                {bookingDone && (
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="mt-4 h-14 w-full rounded-2xl bg-[#0A1134] font-black text-white"
                  >
                    Go To Payment
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-3xl font-black text-[#0A1134]">
  Complete Secure Payment
</h2>

<p className="mt-2 text-gray-500">
  Your scooter is reserved. Complete payment securely through Razorpay to confirm your booking.
</p>

<div className="mt-6 rounded-3xl border border-pink-100 bg-pink-50 p-5">

<p className="text-sm font-semibold text-gray-500">
Amount to Pay
</p>

<input
  type="number"
  value={paymentAmount}
  disabled={!bookingDone || paymentSuccess}
  onChange={(e) => setPaymentAmount(e.target.value)}
  className="mt-3 h-14 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-[#FF165E]"
  placeholder="Pay now amount"
/>

</div>
                 
                <div className="mt-4 grid grid-cols-2 gap-3">
  <AmountBox
    label="Paid"
    value={formatINR(paidAmount)}
    tone="green"
  />

  <AmountBox
    label="Pending"
    value={formatINR(pendingAmount)}
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
                  className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0A1134] font-black text-white disabled:opacity-60"
                >
                  <CreditCard size={18} />

{paymentLoading
 ? "Processing..."
 : "Pay Securely with Razorpay"}
                </button>

                {paymentMessage && (

<div className="mt-5 rounded-3xl border border-blue-200 bg-blue-50 p-5">

<p className="font-bold text-blue-700">
Payment Status
</p>

<p className="mt-2 text-sm text-gray-700">
{paymentMessage}
</p>

</div>

)}

{paymentSuccess && (

<div className="mt-8 rounded-[32px] border border-green-200 bg-gradient-to-br from-green-50 to-white p-8 shadow-lg">

<div className="text-center">

<div className="text-7xl mb-5">
🎉
</div>

<h2 className="text-4xl font-black text-green-700">
Booking Confirmed
</h2>

<p className="mt-3 text-gray-600">
Payment completed successfully.
Your scooter has been reserved.
</p>

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

<div className="mt-8 grid grid-cols-2 gap-4">

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

          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="
rounded-[32px]
bg-white
border
border-gray-100
p-6
shadow-[0_25px_90px_rgba(10,17,52,0.08)]
">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0A1134]">
    Booking Summary
</h2>

<p className="mt-1 text-sm text-gray-500">
    Review your reservation before completing payment.
</p>
                <ReceiptText className="text-[#FF165E]" />
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
                <Summary label="Deposit" value={formatINR(securityDeposit)} />
                <Summary label="Grand Total" value={formatINR(payableAmount)} strong />
                <Summary
  label="Payment"
  value={
    paymentSuccess
      ? "Paid"
      : bookingDone
      ? "Pending"
      : "-"
  }
/>
              </div>

              {bookingId && (
  <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">

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
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 text-blue-700" />
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
    className="mt-4 inline-flex rounded-xl bg-[#0A1134] px-4 py-2 text-sm font-bold text-white"
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
      <label className="mb-2 block text-sm font-bold text-[#0A1134]">{label}</label>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl bg-gray-50 p-8 text-center font-semibold text-gray-500">
      {text}
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
        className="h-14 flex-1 rounded-2xl border border-gray-200 font-bold"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="h-14 flex-1 rounded-2xl bg-[#FF165E] font-black text-white"
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
    <div className={`rounded-2xl p-4 ${classes}`}>
      <p className="text-xs font-bold">{label}</p>
      <p className="text-lg font-black">{value}</p>
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
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3">
      <span className="text-gray-500">{label}</span>
      <span className={strong ? "font-black text-[#0A1134]" : "font-bold text-[#0A1134]"}>
        {value}
      </span>
    </div>
  );
}