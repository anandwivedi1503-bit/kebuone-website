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
