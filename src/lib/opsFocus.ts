/** Cross-dashboard search seed from Ops Eva (Uber-style jump-to-record). */
export const OPS_FOCUS_KEY = "evuddy_ops_focus";

export function writeOpsFocus(query: string) {
  const value = query.trim().slice(0, 120);
  if (!value || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(OPS_FOCUS_KEY, value);
  } catch {
    // ignore private-mode storage failures
  }
}

export function consumeOpsFocus(): string {
  if (typeof window === "undefined") return "";
  try {
    const value = window.sessionStorage.getItem(OPS_FOCUS_KEY) || "";
    if (value) window.sessionStorage.removeItem(OPS_FOCUS_KEY);
    return value.trim();
  } catch {
    return "";
  }
}

export const OPEN_OPS_DESK_EVENT = "evuddy-open-ops-desk";
export const OPEN_OPS_EVA_EVENT = "evuddy-open-ops-eva";

export function openOpsEva(query?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_OPS_EVA_EVENT, { detail: { query: String(query || "").trim() } })
  );
}

export function openOpsDesk(dashboard: string, query?: string) {
  if (typeof window === "undefined") return;
  if (query) writeOpsFocus(query);
  window.dispatchEvent(
    new CustomEvent(OPEN_OPS_DESK_EVENT, { detail: { dashboard } })
  );
}
