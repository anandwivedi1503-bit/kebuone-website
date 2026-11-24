/** Shared ops-desk refresh so Admin and every other dashboard stay in step. */
export const OPS_POLL_MS = 30_000;

/** Poll while visible and skip duplicate refreshes while a request is in flight. */
export function startOpsPoll(load: () => unknown, ms = OPS_POLL_MS) {
  let inFlight = false;

  const tick = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    if (inFlight) return;

    inFlight = true;
    void Promise.resolve()
      .then(load)
      .catch((error) => console.error("OPS DASHBOARD REFRESH ERROR:", error))
      .finally(() => {
        inFlight = false;
      });
  };
  const timer = window.setInterval(tick, ms);
  const onVis = () => {
    if (document.visibilityState !== "hidden") tick();
  };
  const onFocus = () => tick();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", onFocus);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onFocus);
  };
}
