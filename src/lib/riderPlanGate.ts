import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

const RIDER_PLAN_READY_KEY = "kebu_rider_plan_ready";

export function hasRiderPlanReady() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(RIDER_PLAN_READY_KEY) === "1";
}

export function markRiderPlanReady() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(RIDER_PLAN_READY_KEY, "1");
}

export function clearRiderPlanReady() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RIDER_PLAN_READY_KEY);
}

export async function logoutRider() {
  if (typeof window === "undefined") return;

  clearRiderPlanReady();
  window.localStorage.removeItem("kebu_rider_id");
  window.localStorage.removeItem("kebu_rider_phone");

  try {
    await signOut(auth);
  } catch {
    // Still send the rider home even if Firebase sign-out fails.
  }

  window.location.href = "/";
}
