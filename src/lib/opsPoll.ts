/** Shared ops-desk refresh so Admin and every other dashboard stay in step. */
export const OPS_POLL_MS = 8_000;

/** Poll while the tab is visible; refetch immediately when the operator comes back. */
export function startOpsPoll(load: () => void, ms = OPS_POLL_MS) {
  const tick = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    load();
  };
  const timer = window.setInterval(tick, ms);
  const onVis = () => {
    if (document.visibilityState !== "hidden") load();
  };
  const onFocus = () => load();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", onFocus);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onFocus);
  };
}
