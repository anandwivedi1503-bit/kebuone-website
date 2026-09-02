"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Bike,
  CheckCircle2,
  CreditCard,
  Download,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { gstBreakdown } from "@/lib/gst";
import { downloadHtmlFile } from "@/lib/dashboardExport";
import { notifyBrowser } from "@/lib/notifyBrowser";
import { CATALOG_RATES, catalogRate } from "@/lib/rentalPlans";
import RideSwipeControl from "./RideSwipeControl";
import {
  loadRentalDraft,
  markRiderBookingLock,
  rememberRiderProfile,
  saveRentalDraft,
  setChosenPlan,
  syncPlanFromActiveBooking,
} from "@/lib/riderPlanGate";

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(() => loadRentalDraft()?.step || 1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
const [cities, setCities] = useState<CityRecord[]>([]);
const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [city, setCity] = useState(() => loadRentalDraft()?.city || "");
  const [hub, setHub] = useState(() => loadRentalDraft()?.hub || "");
  const [selectedBike, setSelectedBike] = useState(() => loadRentalDraft()?.selectedBike || "");
  const [bikeSearch, setBikeSearch] = useState(() => loadRentalDraft()?.bikeSearch || "");
  const [rentalMode, setRentalMode] = useState<
    "Hourly" | "Daily" | "Weekly" | "Monthly"
  >(() => loadRentalDraft()?.rentalMode || "Daily");
  const [referenceBy, setReferenceBy] = useState(() => loadRentalDraft()?.referenceBy || "");

  const [bookingId, setBookingId] = useState("");
  const [bookingMongoId, setBookingMongoId] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
const [pickupOtp, setPickupOtp] = useState("");
  const [rideEndOtp, setRideEndOtp] = useState("");
  const [rideStatus, setRideStatus] = useState("");
  const [pickupOtpVerified, setPickupOtpVerified] = useState(false);
  const [riderReturnedAt, setRiderReturnedAt] = useState("");
  const [rideSwipeBusy, setRideSwipeBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [bookingPaymentStatus, setBookingPaymentStatus] = useState("");
  const [bookingTotal, setBookingTotal] = useState(0);
  const [reservedBike, setReservedBike] = useState<Vehicle | null>(null);
  const [reservedHub, setReservedHub] = useState<Hub | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [riderId, setRiderId] = useState("");
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const [walletAvailable, setWalletAvailable] = useState(0);
  const [walletStatus, setWalletStatus] = useState("");
  const [helpText, setHelpText] = useState("");
  const [helpStatus, setHelpStatus] = useState("");
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpCategory, setHelpCategory] = useState("BOOKING_ISSUE");
  const [helpTickets, setHelpTickets] = useState<
    Array<{
      ticketId?: string;
      category?: string;
      status?: string;
      description?: string;
      adminRemarks?: string;
    }>
  >([]);
  const [isRentToOwn, setIsRentToOwn] = useState(false);
  const [receipts, setReceipts] = useState<
    Array<{
      transactionId?: string;
      invoiceNumber?: string;
      amount?: number;
      gstAmount?: number;
      paymentMethod?: string;
      remarks?: string;
      createdAt?: string;
    }>
  >([]);
  const [otpSmsStatus, setOtpSmsStatus] = useState("");
  const otpSmsKeyRef = useRef("");
  const recoverPayRef = useRef(false);
  const rentalDraftHydrated = useRef(true);

  const loadData = async (selectedCity = "", silent = false) => {
  try {
    if (!silent) {
    setLoading(true);
    setError("");
    }

    const hubUrl = selectedCity
      ? `/api/hubs?city=${encodeURIComponent(selectedCity)}`
      : "/api/hubs";
    const vehicleUrl = selectedCity
      ? `/api/vehicles?city=${encodeURIComponent(selectedCity)}`
      : "/api/vehicles";

    const [vehicleRes, cityRes, hubRes] = await Promise.all([
      fetch(vehicleUrl),
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
    if (!silent) {
    setError(
      loadError instanceof Error
        ? loadError.message
        : "Unable to load booking data. Please refresh."
    );
    }
  } finally {
    if (!silent) setLoading(false);
  }
};

useEffect(() => {
  void loadData();
}, []);

useEffect(() => {
  if (!rentalDraftHydrated.current) return;
  if (bookingDone) {
    saveRentalDraft({
      step: 4,
      city,
      hub,
      selectedBike,
      rentalMode,
      bikeSearch,
      referenceBy,
    });
    markRiderBookingLock();
    setChosenPlan("rental");
    return;
  }
  saveRentalDraft({
    step,
    city,
    hub,
    selectedBike,
    rentalMode,
    bikeSearch,
    referenceBy,
  });
}, [step, city, hub, selectedBike, rentalMode, bikeSearch, referenceBy, bookingDone]);

useEffect(() => {
  if (!city) return;
  void loadData(city);
}, [city]);

useEffect(() => {
  const timer = window.setInterval(() => {
    if (bookingDone) return;
    void loadData(city, true);
  }, 12000);
  return () => window.clearInterval(timer);
}, [city, bookingDone]);

useEffect(() => {
  if (!bookingDone || !firebaseIdToken) return;
  const refreshMine = async () => {
    try {
      const mineRes = await fetch("/api/bookings/mine", {
        headers: { Authorization: `Bearer ${firebaseIdToken}` },
        cache: "no-store",
      });
      const mineData = await mineRes.json();
      const active = mineData.data;
      if (!mineData.success || !active) return;
      setPaidAmount(Number(active.receivedAmount || 0));
      setPendingAmount(Number(active.pendingAmount || 0));
      setBookingPaymentStatus(String(active.paymentStatus || ""));
      setRideStatus(String(active.rideStatus || ""));
      setPickupOtpVerified(Boolean(active.pickupOTPVerified));
      setPickupOtp(String(active.pickupOTP || ""));
      setRideEndOtp(String(active.rideEndOTP || ""));
      setRiderReturnedAt(active.riderReturnedAt ? String(active.riderReturnedAt) : "");
      setIsRentToOwn(String(active.rentalMode || "") === "Rent To Own");
      if (Number(active.pendingAmount || 0) <= 0.009) setPaymentSuccess(true);
      try {
        const ticketRes = await fetch("/api/tickets/mine", {
          headers: { Authorization: `Bearer ${firebaseIdToken}` },
          cache: "no-store",
        });
        const ticketData = await ticketRes.json();
        if (ticketData.success && Array.isArray(ticketData.data)) {
          setHelpTickets(ticketData.data);
        }
        const receiptRes = await fetch("/api/receipts/mine", {
          headers: { Authorization: `Bearer ${firebaseIdToken}` },
          cache: "no-store",
        });
        const receiptData = await receiptRes.json();
        if (receiptData.success && Array.isArray(receiptData.data)) {
          setReceipts(receiptData.data);
        }
      } catch {}
      if (
        Number(active.receivedAmount || 0) <= 0.009 &&
        Number(active.pendingAmount || 0) > 0.009 &&
        !recoverPayRef.current
      ) {
        recoverPayRef.current = true;
        const recoverRes = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseIdToken}`,
          },
          body: JSON.stringify({
            bookingMongoId: String(active._id || ""),
            recover: true,
            firebaseIdToken,
          }),
        });
        const recoverData = await recoverRes.json();
        if (recoverData.success) {
          setPaidAmount(Number(recoverData.receivedAmount || recoverData.paidAmount || 0));
          setPendingAmount(Number(recoverData.pendingAmount || 0));
          setBookingPaymentStatus(String(recoverData.paymentStatus || ""));
          if (recoverData.pickupOTP) setPickupOtp(String(recoverData.pickupOTP));
          if (recoverData.rideEndOTP) setRideEndOtp(String(recoverData.rideEndOTP));
          if (Number(recoverData.pendingAmount || 0) <= 0.009) setPaymentSuccess(true);
          setError("");
          setMessage(
            recoverData.message ||
              "Payment found on Razorpay and attached to this booking."
          );
        }
      }
    } catch {}
  };
  void refreshMine();
  const timer = window.setInterval(() => void refreshMine(), 12000);
  return () => window.clearInterval(timer);
}, [bookingDone, firebaseIdToken]);

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
      rememberRiderProfile({
        riderId: rider.riderId,
        phone: rider.phone || phone,
        name: rider.fullName,
      });
      setWalletAvailable(Number(rider.walletAvailable ?? rider.walletBalance ?? 0));
      setWalletStatus(String(rider.walletStatus || ""));
      const mineRes = await fetch("/api/bookings/mine", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const mineData = await mineRes.json();
      const active = mineData.data;
      if (mineData.success && active?._id) {
        if (String(active.rentalMode || "") === "Rent To Own") {
          syncPlanFromActiveBooking("Rent To Own");
          window.location.replace("/rent-to-own");
          return;
        }
        syncPlanFromActiveBooking(String(active.rentalMode || "Daily"));
        setBookingId(String(active.bookingId || ""));
        setBookingMongoId(String(active._id));
        setBookingDone(true);
        setStep(4);
        setCity(String(active.pickupCity || city || ""));
        setHub(String(active.startHub || active.pickupHubName || ""));
        setSelectedBike(String(active.vehicleId || ""));
        setRentalMode(
          (["Hourly", "Daily", "Weekly", "Monthly"].includes(String(active.rentalMode))
            ? active.rentalMode
            : "Daily") as "Hourly" | "Daily" | "Weekly" | "Monthly"
        );
        setIsRentToOwn(String(active.rentalMode || "") === "Rent To Own");
        const due = Number(active.paymentDue || 0);
        const received = Number(active.receivedAmount || 0);
        const pending = Number(active.pendingAmount || 0);
        setBookingTotal(due || received + pending);
        setPaidAmount(received);
        setPendingAmount(pending);
        setPaymentAmount(String(pending > 0 ? pending : due || ""));
        setBookingPaymentStatus(String(active.paymentStatus || "Pending"));
        setPaymentSuccess(pending <= 0.009 && received > 0);
        setRideStatus(String(active.rideStatus || ""));
        setPickupOtpVerified(Boolean(active.pickupOTPVerified));
        setPickupOtp(String(active.pickupOTP || ""));
        setRideEndOtp(String(active.rideEndOTP || ""));
        setRiderReturnedAt(active.riderReturnedAt ? String(active.riderReturnedAt) : "");
        setReservedBike({
          _id: String(active.vehicleId || ""),
          vehicleId: String(active.vehicleId || ""),
          vehicleModel: active.vehicleModel,
          registrationNumber: active.vehicleNumber,
          batteryPercentage: active.batteryPercentage,
          currentHub: active.currentHub || active.startHub,
        });
        setReservedHub({
          hubName: active.pickupHubName || active.startHub,
          hubCode: active.startHub,
          hubLocation: "",
        });
        setMessage(
          pending > 0.009
            ? `Open booking ${active.bookingId}. Paid ${received}. Pending ${pending}. Pay remaining here (Razorpay/wallet) or give cash to the yard manager. Ride end OTP is issued only after remaining is ₹0.`
            : `Open booking ${active.bookingId}. Payment for this cycle is complete.`
        );
      }
      try {
        const ticketRes = await fetch("/api/tickets/mine", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const ticketData = await ticketRes.json();
        if (ticketData.success && Array.isArray(ticketData.data)) {
          setHelpTickets(ticketData.data);
        }
        const receiptRes = await fetch("/api/receipts/mine", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const receiptData = await receiptRes.json();
        if (receiptData.success && Array.isArray(receiptData.data)) {
          setReceipts(receiptData.data);
        }
      } catch {}
    } catch (error) {
      console.error(error);
    }
  };

  if (!auth?.app) return;

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

  const currentBike =
    reservedBike ||
    vehicles.find((bike) => bike.vehicleId === selectedBike);

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

const selectedHubData = hubOptions.find((item) => {
  const keys = [item.hubCode, item.hubName, item.hubLocation].map(normalizeText);
  const selected = normalizeText(hub);
  const reserved = normalizeText(
    reservedHub?.hubCode || reservedHub?.hubName || ""
  );
  return (selected && keys.includes(selected)) || (reserved && keys.includes(reserved));
});

useEffect(() => {
  if (!hubs.length) return;
  const match = hubs.find((item) => {
    const keys = [item.hubCode, item.hubName, item.hubLocation].map(normalizeText);
    return (
      keys.includes(normalizeText(hub)) ||
      keys.includes(normalizeText(reservedHub?.hubCode || "")) ||
      keys.includes(normalizeText(reservedHub?.hubName || ""))
    );
  });
  if (!match) return;
  const alreadyMatched =
    reservedHub?.hubCode === match.hubCode &&
    reservedHub?.hubName === match.hubName &&
    reservedHub?.hubLocation === match.hubLocation &&
    reservedHub?.latitude === match.latitude &&
    reservedHub?.longitude === match.longitude;
  if (!alreadyMatched) {
    setReservedHub({
      _id: match._id,
      hubName: match.hubName,
      hubCode: match.hubCode,
      hubLocation: match.hubLocation,
      city: match.city,
      latitude: match.latitude,
      longitude: match.longitude,
    });
  }
  if (match.hubCode && hub !== match.hubCode) {
    setHub(match.hubCode);
  }
}, [hubs, hub, reservedHub?.hubCode, reservedHub?.hubName, reservedHub?.hubLocation, reservedHub?.latitude, reservedHub?.longitude]);

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
          const bikeHub = normalizeText(bike.currentHub);
          const matchesHub = selectedHubKeys.some((hubKey) =>
            hubValuesMatch(bikeHub, hubKey)
          );
          if (!matchesHub) return false;
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

useEffect(() => {
  if (bookingDone || !selectedBike) return;
  if (!filteredBikes.some((bike) => bike.vehicleId === selectedBike)) {
    setSelectedBike("");
  }
}, [filteredBikes, selectedBike, bookingDone]);

const getPlanRate = (bike: Vehicle | undefined, mode: string) => {
  if (mode === "Hourly") return catalogRate("Hourly", bike?.hourlyRate);
  if (mode === "Daily") return catalogRate("Daily", bike?.dailyRate);
  if (mode === "Weekly") return catalogRate("Weekly", bike?.weeklyRate);
  return catalogRate("Monthly", bike?.monthlyRate);
};

const rentalAmount = getPlanRate(currentBike, rentalMode);
const tax = gstBreakdown(rentalAmount);
const securityDeposit = amount(currentBike?.securityDeposit) || COMPANY_SECURITY_DEPOSIT;
const payableAmount =
  bookingTotal > 0
    ? bookingTotal
    : Number((tax.totalWithGst + securityDeposit).toFixed(2));
const amountDue = bookingDone ? pendingAmount : payableAmount;
const remainingPayLocked = bookingDone && (paidAmount > 0 || isRentToOwn);
const walletPayNow = remainingPayLocked
  ? Number(pendingAmount)
  : Number(paymentAmount || amountDue);
const displayHub =
  selectedHubData &&
  (normalizeText(selectedHubData.hubCode) ===
    normalizeText(reservedHub?.hubCode || hub) ||
    normalizeText(selectedHubData.hubName) ===
      normalizeText(reservedHub?.hubName || ""))
    ? selectedHubData
    : selectedHubData || reservedHub;
const hubMapsQuery =
  displayHub?.latitude && displayHub?.longitude
    ? `${displayHub.latitude},${displayHub.longitude}`
    : encodeURIComponent(
        [displayHub?.hubName, displayHub?.hubLocation, displayHub?.city, hub]
          .filter(Boolean)
          .join(", ")
      );
const hubLabel = displayHub
  ? `${displayHub.hubName || displayHub.hubLocation || hub}${
      displayHub.hubCode ? ` (${displayHub.hubCode})` : ""
    }`
  : hub || "-";
const walletCoversPay =
  walletStatus !== "Blocked" &&
  walletAvailable >= walletPayNow &&
  walletPayNow > 0;

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

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingRequestId: crypto.randomUUID(),
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

      const createdId = String(
        bookingData.data?.bookingId || bookingData.bookingId || ""
      );
      if (!createdId) {
        setError("Booking was created but no booking ID was returned.");
        return;
      }
      setBookingId(createdId);
      setBookingMongoId(bookingData.data._id);
      const reservedTotal = Number(
        bookingData.data.paymentDue ||
          bookingData.data.pendingAmount ||
          payableAmount
      );
      setBookingTotal(reservedTotal);
      setPendingAmount(Number(bookingData.data.pendingAmount || reservedTotal));
      setPaymentAmount(String(bookingData.data.pendingAmount || reservedTotal));
      setPaidAmount(Number(bookingData.data.receivedAmount || 0));
      setBookingPaymentStatus(String(bookingData.data.paymentStatus || "Pending"));
      setReservedBike({
        ...(currentBike || ({} as Vehicle)),
        vehicleId: bookingData.data.vehicleId || currentBike?.vehicleId || selectedBike,
        vehicleModel: bookingData.data.vehicleModel || currentBike?.vehicleModel,
        registrationNumber:
          bookingData.data.vehicleNumber || currentBike?.registrationNumber,
        batteryPercentage:
          bookingData.data.batteryPercentage ?? currentBike?.batteryPercentage,
        currentHub: bookingData.data.currentHub || currentBike?.currentHub,
      });
      setReservedHub(
        selectedHubData || {
          hubName: hub,
          hubCode: hub,
          hubLocation: hub,
        }
      );
      setBookingDone(true);
setMessage("Scooter reserved. Pay any amount (minimum ₹1) to get your pickup OTP. Remaining can be paid during the ride or at ride end.");
setStep(4);
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

    const payNow = remainingPayLocked
      ? Number(pendingAmount)
      : Number(paymentAmount || amountDue);

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
    const token = await user?.getIdToken(true);

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
      name: orderData.name || "EVUDDY",
      image: orderData.image,
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
        const verifyBody = {
          bookingMongoId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          firebaseIdToken: token,
        };
        try {
          let verifyData: { success?: boolean; message?: string } | null = null;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(verifyBody),
            });
            verifyData = await verifyRes.json();
            if (verifyData?.success) break;
            await new Promise((resolve) => window.setTimeout(resolve, 1200));
          }
          if (!verifyData?.success) {
            const recoverRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingMongoId,
                recover: true,
                razorpay_order_id: response.razorpay_order_id,
                firebaseIdToken: token,
              }),
            });
            verifyData = await recoverRes.json();
          }
          if (!verifyData?.success) {
            const mineRes = await fetch("/api/bookings/mine", {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            const mineData = await mineRes.json();
            if (Number(mineData.data?.receivedAmount || 0) > 0) {
              applyPaidResult(payNow, mineData.data);
              return;
            }
            setPaymentMessage("");
            setError(
              verifyData?.message ||
                "Razorpay received the payment. Refresh this page and it will attach to your booking."
            );
            setPaymentLoading(false);
            return;
          }
          applyPaidResult(payNow, verifyData);
        } catch (error) {
          console.error(error);
          setPaymentMessage("");
          setError(
            "Razorpay received the payment. Refresh this page and it will attach to your booking."
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

    razorpay.on("payment.failed", (response) => {
      setPaymentLoading(false);
      setPaymentMessage("");
      setError(response.error?.description || "Payment failed. Please try again.");
    });

    razorpay.open();
  };

  const applyPaidResult = (payNow: number, data: {
    pendingAmount?: number;
    remainingAmount?: number;
    receivedAmount?: number;
    paymentDue?: number;
    pickupOTP?: string;
    rideEndOTP?: string;
    message?: string;
    paymentStatus?: string;
    booking?: {
      receivedAmount?: number;
      pendingAmount?: number;
      paymentStatus?: string;
      paymentDue?: number;
      vehicleModel?: string;
      vehicleNumber?: string;
      batteryPercentage?: number;
      pickupOTP?: string;
      rideEndOTP?: string;
    };
    data?: {
      receivedAmount?: number;
      pendingAmount?: number;
      paymentStatus?: string;
      paymentDue?: number;
      vehicleModel?: string;
      vehicleNumber?: string;
      batteryPercentage?: number;
      pickupOTP?: string;
      rideEndOTP?: string;
    };
  }) => {
    const bookingRecord = data.booking || data.data || {};
    const remaining = Number(
      Number(
        data.pendingAmount ??
          data.remainingAmount ??
          bookingRecord.pendingAmount ??
          0
      ).toFixed(2)
    );
    const receivedRaw = Number(
      data.receivedAmount ?? bookingRecord.receivedAmount
    );
    const received = Number.isFinite(receivedRaw)
      ? Number(receivedRaw.toFixed(2))
      : Number((paidAmount + payNow).toFixed(2));
    const due = Number(
      data.paymentDue ?? bookingRecord.paymentDue ?? bookingTotal ?? payableAmount
    );
    if (Number.isFinite(due) && due > 0) {
      setBookingTotal(Number(due.toFixed(2)));
    }
    setPaidAmount(received);
    setPendingAmount(Number(remaining.toFixed(2)));
    setReservedBike((prev) =>
      prev
        ? {
            ...prev,
            vehicleModel: bookingRecord.vehicleModel || prev.vehicleModel,
            registrationNumber:
              bookingRecord.vehicleNumber || prev.registrationNumber,
            batteryPercentage:
              bookingRecord.batteryPercentage ?? prev.batteryPercentage,
          }
        : prev
    );
    setBookingPaymentStatus(
      remaining > 0.009
        ? String(data.paymentStatus || bookingRecord.paymentStatus || "Partial")
        : "Paid"
    );
    const nextPickup = String(data.pickupOTP || bookingRecord.pickupOTP || "");
    const nextRideEnd = String(data.rideEndOTP || bookingRecord.rideEndOTP || "");
    if (nextPickup) setPickupOtp(nextPickup);
    if (nextRideEnd) setRideEndOtp(nextRideEnd);
    void (async () => {
      try {
        const token = firebaseIdToken || (await auth.currentUser?.getIdToken());
        if (!token) return;
        const mineRes = await fetch("/api/bookings/mine", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const mineData = await mineRes.json();
        if (mineData.data?.pickupOTP) setPickupOtp(String(mineData.data.pickupOTP));
        if (mineData.data?.rideEndOTP) setRideEndOtp(String(mineData.data.rideEndOTP));
      } catch {}
    })();
    if (remaining > 0.009) {
      setPaymentSuccess(false);
      setPaymentMessage(
        `Partial payment received. Paid ${formatINR(received)}. Pending ${formatINR(remaining)}.`
      );
      setMessage(
        nextPickup
          ? `Pickup OTP ${nextPickup}. Tell this to the yard. Remaining ${formatINR(remaining)} must be paid before ride end OTP.`
          : `Payment saved. Pickup OTP is shown below and sent to your registered mobile. Remaining ${formatINR(remaining)}.`
      );
      setPaymentAmount(String(Number(remaining.toFixed(2))));
      if (nextPickup) {
        notifyBrowser("EVUDDY pickup OTP", `Pickup OTP ${nextPickup}`);
      }
      setPaymentLoading(false);
      return;
    }
    setPaymentSuccess(true);
    setPaymentMessage(
      data.pickupOTP
        ? `Payment successful. Your pickup OTP is ${data.pickupOTP}.`
        : data.message || "Payment successful. Booking confirmed."
    );
    notifyBrowser(
      "EVUDDY booking update",
      data.pickupOTP
        ? `Pickup OTP ${data.pickupOTP}. Show this at the hub.`
        : "Payment successful. Your scooter is reserved."
    );
    setPaymentLoading(false);
  };

  const sendOtpSms = async () => {
    try {
      const token = firebaseIdToken || (await auth.currentUser?.getIdToken());
      if (!token || !bookingId) return;
      setOtpSmsStatus("Sending OTP SMS...");
      const res = await fetch("/api/notify/booking-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      setOtpSmsStatus(
        String(
          data.message ||
            (data.success
              ? "OTP SMS sent to your registered mobile."
              : "SMS could not be sent. Use the OTP on this page.")
        )
      );
    } catch {
      setOtpSmsStatus("SMS could not be sent. Use the OTP on this page.");
    }
  };

  const swipeRide = async (path: "/api/rides/rider-start" | "/api/rides/rider-end") => {
    setRideSwipeBusy(true);
    setError("");
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        setError("Please sign in again with your registered mobile.");
        return;
      }
      setFirebaseIdToken(token);
      const res = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Unable to update ride.");
        return;
      }
      if (data.rideStatus) setRideStatus(String(data.rideStatus));
      if (data.rideEndOTP) setRideEndOtp(String(data.rideEndOTP));
      if (data.riderReturnedAt) setRiderReturnedAt(String(data.riderReturnedAt));
      if (path === "/api/rides/rider-start") {
        setPickupOtpVerified(true);
        setPickupOtp("");
        setMessage("Ride started. Pay any remaining amount before you return.");
      } else {
        setMessage(
          data.message ||
            "Ride end OTP is ready. Tell this to the yard to return the scooter."
        );
      }
    } catch {
      setError("Unable to update ride. Try again.");
    } finally {
      setRideSwipeBusy(false);
    }
  };

  useEffect(() => {
    if (!bookingId || (!pickupOtp && !rideEndOtp) || !firebaseIdToken) return;
    const key = `${bookingId}:${pickupOtp}:${rideEndOtp}`;
    if (otpSmsKeyRef.current === key) return;
    otpSmsKeyRef.current = key;
    void sendOtpSms();
  }, [bookingId, pickupOtp, rideEndOtp, firebaseIdToken]);

  const payWithWallet = async () => {
    setError("");
    setPaymentMessage("");
    setPaymentLoading(true);

    if (!bookingMongoId) {
      setError("Reserve Scooter first.");
      setPaymentLoading(false);
      return;
    }

    const payNow = remainingPayLocked
      ? Number(pendingAmount)
      : Number(paymentAmount || amountDue);
    if (!Number.isFinite(payNow) || payNow < 1 || payNow > amountDue) {
      setError(`Enter a payment amount between INR 1 and ${formatINR(amountDue)}.`);
      setPaymentLoading(false);
      return;
    }

    if (walletAvailable < payNow) {
      setError(
        `Wallet has ${formatINR(walletAvailable)}. Recharge it or pay with Razorpay.`
      );
      setPaymentLoading(false);
      return;
    }

    const user = auth.currentUser;
    const token = await user?.getIdToken(true);
    if (!token) {
      setError("Please verify your phone number before payment.");
      setPaymentLoading(false);
      return;
    }
    setFirebaseIdToken(token);
    setPaymentMessage("Paying from wallet...");

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
      setPaymentMessage("");
      setError(orderData.message || "Wallet payment failed.");
      setPaymentLoading(false);
      return;
    }

    setWalletAvailable((old) => Number(Math.max(0, old - payNow).toFixed(2)));
    applyPaidResult(payNow, orderData);
    try {
      const riderRes = await fetch(`/api/riders?phone=${riderPhone}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const riderData = await riderRes.json();
      if (riderData.success) {
        setWalletAvailable(
          Number(
            riderData.data.walletAvailable ?? riderData.data.walletBalance ?? 0
          )
        );
        setWalletStatus(String(riderData.data.walletStatus || ""));
      }
    } catch {}
  };

  const sendHelpTicket = async () => {
    setHelpStatus("");
    const description = helpText.trim();
    if (description.length < 10) {
      setHelpStatus("Describe the issue in at least 10 characters.");
      return;
    }
    const token = firebaseIdToken || (await auth.currentUser?.getIdToken());
    if (!token || !bookingId) {
      setHelpStatus("Sign in and complete booking first.");
      return;
    }
    setHelpLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId: `BK-${Date.now()}`,
          bookingId,
          userId: riderPhone || riderId,
          category: helpCategory || "BOOKING_ISSUE",
          description: `${rideStatus === "In Ride" ? "During ride: " : ""}${description}`.slice(0, 500),
          firebaseIdToken: token,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setHelpStatus(data.errors?.join(" ") || data.message || "Could not send ticket.");
        return;
      }
      setHelpText("");
      setHelpStatus("Support ticket sent. You can track status below. Hub staff see it on Support.");
      try {
        const ticketRes = await fetch("/api/tickets/mine", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const ticketData = await ticketRes.json();
        if (ticketData.success && Array.isArray(ticketData.data)) {
          setHelpTickets(ticketData.data);
        }
      } catch {}
    } finally {
      setHelpLoading(false);
    }
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
        <div className="mb-16 text-center print:hidden">

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
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-700 print:hidden">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 font-semibold text-green-700 print:hidden">
            {message}
          </div>
        )}

        <div className="mb-10 print:hidden">
  <div className="flex items-start justify-between gap-1 sm:gap-2">

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

      const done =
        index + 1 < step || (index === 3 && paymentSuccess);
      const onStep = step === index + 1 && !(index === 3 && paymentSuccess);

      return (

        <div
          key={item.title}
          className="flex min-w-0 flex-1 items-center"
        >

          <div className="flex min-w-0 flex-col items-center">

            <div
              className={`
flex h-10 w-10 items-center justify-center rounded-full text-base shadow-md transition-all duration-500 sm:h-14 sm:w-14 sm:text-2xl
${
done
? "scale-105 bg-gradient-to-br from-[#16A34A] to-[#18B368] text-white sm:scale-110"
: onStep
? "scale-105 bg-gradient-to-br from-[#16A34A] to-[#18B368] text-white sm:scale-110"
: "border border-slate-200 bg-white text-slate-500"
}
`}
            >

              {done ? "✓" : item.icon}

            </div>

            <h3
              className={`
mt-2 text-center text-[11px] font-bold sm:mt-4 sm:text-[15px]
${
done || onStep
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
mx-1 mb-6 h-[2px] flex-1 rounded-full sm:mx-4 sm:mb-8 sm:h-[4px]
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
          
<div className="grid gap-10 lg:grid-cols-[1.38fr_0.62fr]">
          <form
            onSubmit={createBooking}
            className="rounded-[36px] border border-white bg-white/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,.12)] backdrop-blur-xl print:hidden md:p-10"
          >
            <div className="mb-6 rounded-[24px] border border-[#18B368]/15 bg-[#F7FBF8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Rental prices</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Hourly {formatINR(CATALOG_RATES.Hourly)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Daily {formatINR(CATALOG_RATES.Daily)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Weekly {formatINR(CATALOG_RATES.Weekly)}</span>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold">Monthly {formatINR(CATALOG_RATES.Monthly)}</span>
              </div>
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Rent to Own is frozen for this normal booking. Logout if you need to switch plans.
              </div>
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

                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Rent to Own is frozen because you chose normal booking.
                </div>

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
      value={hubLabel}
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
<span className="text-sm font-bold uppercase tracking-[0.15em] text-[#18B368]">
{paymentSuccess ? "BOOKING CONFIRMED" : remainingPayLocked ? "REMAINING PAYMENT" : "SECURE PAYMENT"}
</span>
</div>
<h2 className="mt-5 text-4xl font-black tracking-[-0.03em] text-[#0F172A]">
{paymentSuccess
  ? "You're booked"
  : remainingPayLocked
  ? "Pay the remaining amount"
  : "Complete your payment"}
</h2>
<p className="mt-3 max-w-2xl text-[17px] leading-8 text-slate-500">
{paymentSuccess
  ? "Payment is complete. Use the OTP below at the selected yard. Download the summary if you want a copy."
  : remainingPayLocked
  ? "Pickup OTP is already issued. Razorpay will charge only the remaining due."
  : "Your scooter is reserved. Pay any amount from ₹1 to get pickup OTP. Remaining can be paid during the ride."}
</p>
</div>

{!paymentSuccess ? (
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
{remainingPayLocked
  ? "Remaining due only. This is the amount Razorpay will charge now."
  : "First payment can be any amount from ₹1 up to the total. Pickup OTP is issued after the first payment."}
</p>
{remainingPayLocked ? (
  <div className="mt-4 flex h-16 items-center rounded-2xl border border-slate-200 bg-slate-50 px-6 text-[22px] font-black text-[#16A34A]">
    {formatINR(pendingAmount)}
  </div>
) : (
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
focus:border-[#18B368]
focus:ring-4
focus:ring-[#18B368]/10
"
  placeholder="Pay now amount"
/>
)}

</div>
) : null}

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
    value={formatINR(pendingAmount || Math.max(0, payableAmount - paidAmount))}
    tone="amber"
  />
</div>

                {bookingDone && paidAmount > 0 ? (
                  <div className="mt-4 space-y-3">
                    {pickupOtp && !pickupOtpVerified ? (
                      <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-800">
                          Pickup OTP — tell this to the yard
                        </p>
                        <p className="mt-2 text-5xl font-black tracking-[0.28em] text-green-700">
                          {pickupOtp}
                        </p>
                        <p className="mt-2 text-sm text-green-800">
                          Tell this OTP at {hubLabel}. After the yard saves it, swipe Ride started below.
                        </p>
                        <button
                          type="button"
                          onClick={() => void sendOtpSms()}
                          className="mt-3 rounded-full border border-green-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-green-800"
                        >
                          Resend OTP SMS
                        </button>
                        {otpSmsStatus ? (
                          <p className="mt-2 text-xs text-green-900">{otpSmsStatus}</p>
                        ) : null}
                      </div>
                    ) : pickupOtpVerified && rideStatus !== "In Ride" ? (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-950">
                        Yard confirmed pickup and unlocked the scooter. Slide to start your ride.
                      </div>
                    ) : rideStatus === "In Ride" ? null : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                        Pickup OTP is being prepared. Keep this page open — it appears here for the yard.
                      </div>
                    )}

                    {pickupOtpVerified && rideStatus !== "In Ride" && rideStatus !== "Completed" ? (
                      <RideSwipeControl
                        label="Slide to start ride"
                        hint="Yard has saved your pickup OTP. Slide to mark the ride as started."
                        busy={rideSwipeBusy}
                        onConfirm={() => swipeRide("/api/rides/rider-start")}
                      />
                    ) : null}

                    {rideStatus === "In Ride" && pendingAmount > 0.009 ? (
                      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
                        {isRentToOwn
                          ? `Today’s Rent to Own ${formatINR(pendingAmount)} (₹280 + GST) is due. Pay here or as cash at the yard. Keep the scooter — no ride-end OTP.`
                          : `Remaining ${formatINR(pendingAmount)} must be paid here or as cash at the yard before you can swipe Ride end. Paying remaining does not create the OTP yet.`}
                      </p>
                    ) : null}

                    {rideStatus === "Completed" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-5 py-6 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                          Ride complete
                        </p>
                        <p className="mt-2 text-2xl font-black text-[#0F172A]">
                          Thank you for riding with EVUDDY
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          The yard has taken the scooter back. We hope to see you again soon. Deposit refunds (if any) are approved by admin after return.
                        </p>
                      </div>
                    ) : null}

                    {rideEndOtp ? (
                      <div className="rounded-2xl bg-slate-900 px-5 py-5 text-white">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-300">
                          Ride end OTP — tell this to the yard on return
                        </p>
                        <p className="mt-2 text-5xl font-black tracking-[0.28em]">{rideEndOtp}</p>
                        <p className="mt-2 text-sm text-slate-200">
                          Same as pickup: you generate it, the yard enters it, then the scooter is taken in.
                        </p>
                        <button
                          type="button"
                          onClick={() => void sendOtpSms()}
                          className="mt-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white print:hidden"
                        >
                          Resend OTP SMS
                        </button>
                      </div>
                    ) : rideStatus === "In Ride" && pendingAmount <= 0.009 && !isRentToOwn ? (
                      <RideSwipeControl
                        label="Slide to end ride"
                        hint="Remaining is ₹0. You are at the yard. Slide to generate ride-end OTP — same moment as pickup OTP after first pay."
                        busy={rideSwipeBusy}
                        onConfirm={() => swipeRide("/api/rides/rider-end")}
                      />
                    ) : rideStatus === "In Ride" && isRentToOwn && pendingAmount <= 0.009 ? (
                      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
                        Today’s Rent to Own day is paid. Keep the scooter. Tomorrow’s ₹280 + GST will appear here when due. No ride-end OTP.
                      </p>
                    ) : null}
                  </div>
                ) : bookingDone ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                    Reserve is holding the scooter. Pay at least ₹1 to get pickup OTP.
                  </div>
                ) : null}

                {!paymentSuccess && rideStatus !== "Completed" ? (
                <>
                <button
                  type="button"
                  disabled={
   !bookingDone ||
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
 : remainingPayLocked
 ? `Pay remaining ${formatINR(pendingAmount)} with Razorpay`
 : "Pay Securely with Razorpay"}
                </button>

                <button
                  type="button"
                  disabled={
                    !bookingDone ||
                    amountDue <= 0 ||
                    paymentLoading ||
                    !walletCoversPay
                  }
                  onClick={() => void payWithWallet()}
                  className="
mt-3
flex
h-16
w-full
items-center
justify-center
gap-3
rounded-2xl
border
border-[#18B368]
bg-white
font-bold
tracking-wide
text-[#0F172A]
transition-all
duration-300
hover:-translate-y-0.5
disabled:opacity-60
"
                >
                  <Wallet size={18} />
                  {walletAvailable < 1
                    ? "Wallet ₹0.00 — use Razorpay"
                    : walletCoversPay
                    ? `Pay ${formatINR(walletPayNow)} from wallet`
                    : `Wallet ${formatINR(walletAvailable)} — not enough for this amount`}
                </button>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Wallet is EVUDDY credit (returned deposits and admin top-ups), not UPI/card. Razorpay is the normal online path. You can also hand cash to the yard manager — they record it on Hub/Booking and must handover that cash to the company.
                </p>
                </>
                ) : null}

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

{(bookingDone && paidAmount > 0) && (
<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-left">
  <p className="font-bold text-[#0F172A]">Need help with this booking?</p>
  <p className="mt-1 text-sm text-slate-500">
    Use this during pickup or mid-ride: unlock, breakdown, battery, payment. Hub staff see it immediately and you see their reply below.
  </p>
  <select
    value={helpCategory}
    onChange={(e) => setHelpCategory(e.target.value)}
    className="mt-3 h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#18B368]"
  >
    <option value="BOOKING_ISSUE">Booking / general</option>
    <option value="UNLOCK_ISSUE">Unlock / pickup OTP</option>
    <option value="VEHICLE_BREAKDOWN">Scooter breakdown</option>
    <option value="BATTERY_ISSUE">Battery / range / swap</option>
    <option value="PAYMENT_ISSUE">Payment</option>
    <option value="REFUND_REQUEST">Deposit refund</option>
  </select>
  <textarea
    value={helpText}
    onChange={(e) => setHelpText(e.target.value)}
    rows={3}
    className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#18B368]"
    placeholder="What happened? Example: scooter stopped, battery died, puncture..."
  />
  <button
    type="button"
    disabled={helpLoading}
    onClick={() => void sendHelpTicket()}
    className="mt-3 h-11 rounded-full bg-[#0F172A] px-5 text-sm font-bold text-white disabled:opacity-60"
  >
    {helpLoading ? "Sending..." : "Send to support"}
  </button>
  {helpStatus ? <p className="mt-2 text-sm text-slate-600">{helpStatus}</p> : null}
  {helpTickets.length ? (
    <div className="mt-4 space-y-2">
      {helpTickets.slice(0, 5).map((ticket) => (
          <div
            key={String(ticket.ticketId)}
            className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-sm"
          >
            <p className="font-bold text-[#0F172A]">
              {ticket.ticketId} · {ticket.status} · {String(ticket.category || "").replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-slate-600">{ticket.description}</p>
            {ticket.adminRemarks ? (
              <p className="mt-2 text-emerald-800">
                Staff: {ticket.adminRemarks}
              </p>
            ) : ticket.status === "OPEN" || ticket.status === "IN-PROGRESS" ? (
              <p className="mt-2 text-amber-800">Hub staff are working on this.</p>
            ) : null}
          </div>
        ))}
    </div>
  ) : null}
  {isRentToOwn ? (
    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
      <p className="text-sm font-bold text-emerald-900">Your daily receipts</p>
      <p className="mt-1 text-xs text-emerald-800">
        Each day’s ₹280 + 5% GST is recorded here and emailed/SMS’d to you as a receipt.
      </p>
      {receipts.length ? (
      <ul className="mt-2 space-y-1 text-xs text-emerald-950">
        {receipts.slice(0, 8).map((row) => (
          <li key={String(row.transactionId)}>
            {row.invoiceNumber || row.transactionId} · ₹{Number(row.amount || 0).toFixed(2)} ·{" "}
            {row.paymentMethod} · {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : ""}
          </li>
        ))}
      </ul>
      ) : (
        <p className="mt-2 text-xs text-emerald-800">Receipts appear as soon as today’s payment is captured.</p>
      )}
    </div>
  ) : null}
</div>
)}
              </div>
            )}
          </form>

          <aside id="booking-print-summary" className="space-y-6 lg:sticky lg:top-24 xl:top-28 self-start">
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
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                    Reservation
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#0F172A]">
                    Booking summary
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Dates, hub, vehicle, and amounts for this booking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rows: Array<[string, string]> = [
                      ["Booking ID", bookingId || "-"],
                      ["Rider", riderName || "-"],
                      ["Phone", riderPhone || "-"],
                      ["City", city || "-"],
                      ["Hub", hubLabel || "-"],
                      ["Bike", selectedBike || "-"],
                      ["Model", currentBike?.vehicleModel || "-"],
                      ["Registration", currentBike?.registrationNumber || "-"],
                      ["Rental", formatINR(rentalAmount)],
                      ["CGST 2.5%", formatINR(tax.cgstAmount)],
                      ["SGST 2.5%", formatINR(tax.sgstAmount)],
                      ["Deposit (held until return)", formatINR(securityDeposit)],
                      ["Paid", formatINR(paidAmount)],
                      ["Pending", formatINR(pendingAmount)],
                    ];
                    const html = `<!doctype html><html><head><meta charset="utf-8"><title>EVUDDY ${bookingId || "booking"}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{color:#18B368}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #e5e7eb;padding:10px 0}td:first-child{font-weight:700;width:42%}</style></head><body>
<p>EVUDDY · SMART ELECTRIC MOBILITY</p>
<h1>Booking summary</h1>
<table>${rows.map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`).join("")}</table>
<p style="margin-top:24px;font-size:12px;color:#64748b">Security deposit is held until the scooter is returned. Ride-end OTP is issued only after remaining fare is ₹0 and you swipe at the yard.</p>
</body></html>`;
                    downloadHtmlFile(
                      `EVUDDY-booking-${bookingId || "summary"}.html`,
                      html
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 shadow-sm print:hidden"
                >
                  <Download size={16} className="text-[#18B368]" />
                  Download file
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <Summary label="Rider" value={riderName || "-"} />
                <Summary label="Phone" value={riderPhone || "-"} />
                <Summary label="City" value={city || "-"} />
                <Summary label="Hub" value={hubLabel} />
                {displayHub?.hubLocation &&
                displayHub.hubLocation !== displayHub.hubName ? (
                  <Summary label="Yard address" value={String(displayHub.hubLocation)} />
                ) : null}
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
                {bookingDone ? (
                  <>
                    <Summary label="Paid" value={formatINR(paidAmount)} />
                    <Summary label="Pending" value={formatINR(pendingAmount)} />
                  </>
                ) : null}
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
        : bookingPaymentStatus === "Partial" || (bookingDone && paidAmount > 0)
        ? "bg-sky-100 text-sky-800"
        : bookingDone
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600"
    }
    `}
  >
    {
      paymentSuccess
        ? "PAID"
        : bookingPaymentStatus === "Partial" || (bookingDone && paidAmount > 0)
        ? "PARTIAL"
        : bookingDone
        ? "PENDING"
        : "NOT STARTED"
    }
  </span>
</div>
                {pickupOtp ? <Summary label="Pickup OTP" value={pickupOtp} strong /> : null}
                {rideEndOtp ? <Summary label="Ride end OTP" value={rideEndOtp} strong /> : null}
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

            {displayHub && (
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
                    <h3 className="font-black text-[#0A1134]">{displayHub.hubName || hubLabel}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600 break-words">
                      {displayHub.hubLocation || displayHub.hubName || hubLabel}
                    </p>
                    {displayHub.city ? (
                      <p className="mt-1 text-sm text-gray-500">{displayHub.city}</p>
                    ) : null}

{displayHub.latitude && displayHub.longitude ? (
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${displayHub.latitude},${displayHub.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#18B368] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 print:hidden"
  >
    Open in Google Maps
  </a>
) : hubMapsQuery ? (
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${hubMapsQuery}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#18B368] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 print:hidden"
  >
    Open in Google Maps
  </a>
) : null}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      <style>{`
        @media print {
          header, nav, footer, .print\\:hidden { display: none !important; }
          body { background: white !important; }
          #booking-print-summary {
            position: static !important;
            width: 100% !important;
            box-shadow: none !important;
          }
        }
      `}</style>
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
items-start
justify-between
gap-4
border-b
border-slate-100
py-3
"
>
      <span
className="
shrink-0
max-w-[42%]
text-[12px]
font-semibold
uppercase
tracking-[0.06em]
text-slate-500
"
>{label}</span>
      <span
className={
strong
? "text-right text-base font-black text-[#16A34A] break-words"
: "text-right font-semibold text-[#0F172A] break-words"
}
>
        {value}
      </span>
    </div>
  );
}
