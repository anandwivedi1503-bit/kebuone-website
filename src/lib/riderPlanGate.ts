import { signOut } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase";

export const RIDER_SESSION_EVENT = "kebu-rider-session";
export const RIDER_ACCOUNT_OPEN_EVENT = "kebu-open-rider-account";

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

function storageGet(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    // Private mode / quota — never crash the site.
  }
}

function storageRemove(store: Storage, key: string) {
  try {
    store.removeItem(key);
  } catch {
    // ignore
  }
}

function readKey(key: string) {
  if (typeof window === "undefined") return null;
  const local = storageGet(window.localStorage, key);
  if (local) return local;
  const session = storageGet(window.sessionStorage, key);
  if (session) {
    storageSet(window.localStorage, key, session);
    return session;
  }
  return null;
}

function writeKey(key: string, value: string, emit = true) {
  if (typeof window === "undefined") return;
  storageSet(window.localStorage, key, value);
  storageSet(window.sessionStorage, key, value);
  if (emit) emitRiderSession();
}

function removeKey(key: string) {
  if (typeof window === "undefined") return;
  storageRemove(window.localStorage, key);
  storageRemove(window.sessionStorage, key);
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
  if (!hasRiderPlanReady()) return "/ride-options";
  const plan = getChosenPlan();
  if (plan === "rto") return "/rent-to-own";
  if (plan === "rental") return "/book-bike?flow=rental";
  return "/ride-options";
}

export function isRiderLoggedIn() {
  if (typeof window === "undefined") return false;
  if (!hasRiderPlanReady()) return false;
  const profile = getRiderProfile();
  if (!profile.phone && !profile.riderId) return false;
  if (firebaseAuth && !firebaseAuth.currentUser) return false;
  return true;
}

export function getRiderProfile() {
  if (typeof window === "undefined") {
    return { riderId: "", phone: "", name: "" };
  }
  return {
    riderId:
      storageGet(window.localStorage, "kebu_rider_id") ||
      storageGet(window.sessionStorage, "kebu_rider_id") ||
      "",
    phone:
      storageGet(window.localStorage, "kebu_rider_phone") ||
      storageGet(window.sessionStorage, "kebu_rider_phone") ||
      "",
    name:
      storageGet(window.localStorage, "kebu_rider_name") ||
      storageGet(window.sessionStorage, "kebu_rider_name") ||
      "",
  };
}

export function rememberRiderProfile(profile: {
  riderId?: string;
  phone?: string;
  name?: string;
}) {
  if (typeof window === "undefined") return;
  if (profile.riderId) {
    storageSet(window.localStorage, "kebu_rider_id", profile.riderId);
    storageSet(window.sessionStorage, "kebu_rider_id", profile.riderId);
  }
  if (profile.phone) {
    storageSet(window.localStorage, "kebu_rider_phone", profile.phone);
    storageSet(window.sessionStorage, "kebu_rider_phone", profile.phone);
  }
  if (profile.name) {
    storageSet(window.localStorage, "kebu_rider_name", profile.name);
    storageSet(window.sessionStorage, "kebu_rider_name", profile.name);
  }
  emitRiderSession();
}

export function openRiderAccountMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RIDER_ACCOUNT_OPEN_EVENT));
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

export function clearRiderClientSession() {
  if (typeof window === "undefined") return;

  removeKey(PLAN_READY_KEY);
  removeKey(CHOSEN_PLAN_KEY);
  removeKey(BOOKING_LOCK_KEY);
  removeKey(RIDE_OPTIONS_VIEW_KEY);
  removeKey(RENTAL_DRAFT_KEY);
  removeKey(RTO_DRAFT_KEY);
  storageRemove(window.localStorage, "kebu_rider_id");
  storageRemove(window.localStorage, "kebu_rider_phone");
  storageRemove(window.localStorage, "kebu_rider_name");
  storageRemove(window.sessionStorage, "kebu_rider_id");
  storageRemove(window.sessionStorage, "kebu_rider_phone");
  storageRemove(window.sessionStorage, "kebu_rider_name");
  emitRiderSession();
}

export async function logoutRider() {
  if (typeof window === "undefined") return;

  clearRiderClientSession();

  try {
    if (firebaseAuth) await signOut(firebaseAuth);
  } catch {
    // Still send the rider home even if Firebase sign-out fails.
  }

  window.location.href = "/";
}
