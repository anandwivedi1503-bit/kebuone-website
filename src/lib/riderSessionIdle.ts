/** Rider wizard inactivity — auto sign-out so half-finished flows do not hold the site busy. */
export const RIDER_IDLE_TIMEOUT_MS = 10 * 60 * 1000;

const ACTIVITY_KEY = "kebu_rider_last_activity_ms";

export function touchRiderActivity() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function riderIdleExpired() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem(ACTIVITY_KEY);
    if (!raw) return false;
    const last = Number(raw);
    if (!Number.isFinite(last) || last <= 0) return false;
    return Date.now() - last > RIDER_IDLE_TIMEOUT_MS;
  } catch {
    return false;
  }
}

export function clearRiderActivityClock() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ACTIVITY_KEY);
  } catch {
    // ignore
  }
}
