import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

export const RIDER_SESSION_EVENT = "kebu-rider-session";

const PLAN_READY_KEY = "kebu_rider_plan_ready";
const CHOSEN_PLAN_KEY = "kebu_rider_chosen_plan";
const BOOKING_LOCK_KEY = "kebu_rider_booking_lock";
const RIDE_OPTIONS_VIEW_KEY = "kebu_ride_options_view";
const RENTAL_DRAFT_KEY = "kebu_rider_rental_draft";
const RTO_DRAFT_KEY = "kebu_rider_rto_draft";

export type RiderChosenPlan = "rental" | "rto";
export type RideOptionsView = "otp" | "pending" | "plans" | "register";
export type RentalModeDraft = "Hourly" | "Daily" | "Weekly" | "Monthly";

export type RentalWizardDraft = {
  step: 1 | 2 | 3 | 4;
  city: string;
  hub: string;
  selectedBike: string;
  rentalMode: RentalModeDraft;
  bikeSearch: string;
  referenceBy: string;
};

export type RtoWizardDraft = {
  step: 1 | 2 | 3 | 4;
  city: string;
  hub: string;
  selectedBike: string;
  occupation: string;
  guardianName: string;
  nomineeName: string;
  nomineeRelation: string;
  emergencyPhone: string;
  address: string;
  agreed: boolean;
  riderEmail: string;
};

function emitRiderSession() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RIDER_SESSION_EVENT));
}

function readKey(key: string) {
  if (typeof window === "undefined") return null;
  const local = window.localStorage.getItem(key);
  if (local) return local;
  const session = window.sessionStorage.getItem(key);
  if (session) {
    window.localStorage.setItem(key, session);
    return session;
  }
  return null;
}

function writeKey(key: string, value: string, emit = true) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  window.sessionStorage.setItem(key, value);
  if (emit) emitRiderSession();
}

function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function hasRiderPlanReady() {
  return readKey(PLAN_READY_KEY) === "1";
}

export function markRiderPlanReady() {
  writeKey(PLAN_READY_KEY, "1");
}

export function clearRiderPlanReady() {
  removeKey(PLAN_READY_KEY);
  emitRiderSession();
}

export function getChosenPlan(): RiderChosenPlan | "" {
  const value = readKey(CHOSEN_PLAN_KEY);
  return value === "rental" || value === "rto" ? value : "";
}

export function setChosenPlan(plan: RiderChosenPlan) {
  writeKey(CHOSEN_PLAN_KEY, plan);
}

export function hasRiderBookingLock() {
  return readKey(BOOKING_LOCK_KEY) === "1";
}

export function markRiderBookingLock() {
  writeKey(BOOKING_LOCK_KEY, "1");
}

export function getRideOptionsView(): RideOptionsView | "" {
  const value = readKey(RIDE_OPTIONS_VIEW_KEY);
  if (value === "otp" || value === "pending" || value === "plans" || value === "register") {
    return value;
  }
  return "";
}

export function setRideOptionsView(view: RideOptionsView) {
  writeKey(RIDE_OPTIONS_VIEW_KEY, view);
}

export function riderResumeHref() {
  const plan = getChosenPlan();
  if (plan === "rto") return "/rent-to-own";
  if (plan === "rental") return "/book-bike?flow=rental";
  if (hasRiderPlanReady()) return "/ride-options";
  return "/ride-options";
}

export function getRiderProfile() {
  if (typeof window === "undefined") {
    return { riderId: "", phone: "" };
  }
  return {
    riderId: window.localStorage.getItem("kebu_rider_id") || "",
    phone: window.localStorage.getItem("kebu_rider_phone") || "",
  };
}

function readJson<T>(key: string): T | null {
  try {
    const raw = readKey(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadRentalDraft(): RentalWizardDraft | null {
  const draft = readJson<RentalWizardDraft>(RENTAL_DRAFT_KEY);
  if (!draft || ![1, 2, 3, 4].includes(Number(draft.step))) return null;
  return draft;
}

export function saveRentalDraft(draft: RentalWizardDraft) {
  writeKey(RENTAL_DRAFT_KEY, JSON.stringify(draft), false);
}

export function clearRentalDraft() {
  removeKey(RENTAL_DRAFT_KEY);
  emitRiderSession();
}

export function loadRtoDraft(): RtoWizardDraft | null {
  const draft = readJson<RtoWizardDraft>(RTO_DRAFT_KEY);
  if (!draft || ![1, 2, 3, 4].includes(Number(draft.step))) return null;
  return draft;
}

export function saveRtoDraft(draft: RtoWizardDraft) {
  writeKey(RTO_DRAFT_KEY, JSON.stringify(draft), false);
}

export function clearRtoDraft() {
  removeKey(RTO_DRAFT_KEY);
  emitRiderSession();
}

export function syncPlanFromActiveBooking(rentalMode?: string) {
  if (String(rentalMode || "") === "Rent To Own") {
    setChosenPlan("rto");
  } else if (rentalMode) {
    setChosenPlan("rental");
  }
  markRiderBookingLock();
  markRiderPlanReady();
}

export async function logoutRider() {
  if (typeof window === "undefined") return;

  removeKey(PLAN_READY_KEY);
  removeKey(CHOSEN_PLAN_KEY);
  removeKey(BOOKING_LOCK_KEY);
  removeKey(RIDE_OPTIONS_VIEW_KEY);
  removeKey(RENTAL_DRAFT_KEY);
  removeKey(RTO_DRAFT_KEY);
  window.localStorage.removeItem("kebu_rider_id");
  window.localStorage.removeItem("kebu_rider_phone");
  emitRiderSession();

  try {
    await signOut(auth);
  } catch {
    // Still send the rider home even if Firebase sign-out fails.
  }

  window.location.href = "/";
}
