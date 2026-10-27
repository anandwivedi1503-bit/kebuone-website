/** Turn Razorpay SDK / API errors into a short human-readable string. */
export function formatRazorpayError(error: unknown): string {
  if (error instanceof Error && error.message && error.message !== "[object Object]") {
    return error.message;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const nested = record.error;
    if (nested && typeof nested === "object") {
      const err = nested as Record<string, unknown>;
      const description = String(err.description || err.reason || "").trim();
      const code = String(err.code || "").trim();
      if (description && code) return `${description} (${code})`;
      if (description) return description;
      if (code) return code;
    }
    const description = String(record.description || record.reason || "").trim();
    if (description) return description;
    try {
      const json = JSON.stringify(error);
      if (json && json !== "{}") return json.slice(0, 280);
    } catch {
      // ignore
    }
  }

  const fallback = String(error ?? "").trim();
  return fallback && fallback !== "[object Object]"
    ? fallback
    : "Razorpay refund failed. Check capture on this booking or use wallet credit for cash/offline.";
}
