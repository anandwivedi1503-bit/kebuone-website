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
