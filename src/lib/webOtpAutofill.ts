/** Best-effort Web OTP autofill (Chrome/Android). Requires user gesture on some builds. */
export async function readSmsOtpCode(signal?: AbortSignal): Promise<string | null> {
  if (typeof window === "undefined" || !("OTPCredential" in window)) return null;
  try {
    const cred = (await navigator.credentials.get({
      otp: { transport: ["sms"] },
      signal,
    } as CredentialRequestOptions)) as { code?: string } | null;
    const code = String(cred?.code || "").replace(/\D/g, "").slice(0, 6);
    return code.length === 6 ? code : null;
  } catch {
    return null;
  }
}
