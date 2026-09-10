/** Shared ops-desk refresh so Admin and every other dashboard stay in step. */
export const OPS_POLL_MS = 15_000;

/** Poll while the tab is visible; refetch immediately when the operator comes back. */
export function startOpsPoll(load: () => void, ms = OPS_POLL_MS) {
  const tick = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    load();
  };
  const timer = window.setInterval(tick, ms);
  const onVis = () => {
    if (document.visibilityState === "visible") load();
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", onVis);
  };
}
