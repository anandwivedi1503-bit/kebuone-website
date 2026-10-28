/** INR amounts safe for Razorpay (2 decimal places, integer paise). */
export function inrToPaise(amountInr: number) {
  const n = Number(amountInr);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function paiseToInr(paise: number) {
  return Number((Math.round(paise) / 100).toFixed(2));
}

export function normalizePayAmountInr(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return paiseToInr(inrToPaise(fallback));
  return paiseToInr(inrToPaise(n));
}
