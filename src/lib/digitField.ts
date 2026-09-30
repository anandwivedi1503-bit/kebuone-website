/** Keep digits only. Cap length when the field has a known size (phone 10, Aadhaar 12, OTP 6). */
export function digitFieldValue(text: string, maxDigits?: number): string {
  const digits = String(text ?? "").replace(/\D/g, "");
  return typeof maxDigits === "number" ? digits.slice(0, maxDigits) : digits;
}

export function isDigitInputField(opts: {
  numeric?: boolean;
  type?: string;
  inputMode?: string;
}): boolean {
  return Boolean(
    opts.numeric || opts.type === "tel" || opts.inputMode === "numeric"
  );
}

/** Phone/tel fields default to 10. Other numeric fields must pass maxDigits or they are not truncated. */
export function digitFieldCap(opts: {
  numeric?: boolean;
  type?: string;
  maxDigits?: number;
}): number | undefined {
  if (typeof opts.maxDigits === "number") return opts.maxDigits;
  if (opts.numeric || opts.type === "tel") return 10;
  return undefined;
}
