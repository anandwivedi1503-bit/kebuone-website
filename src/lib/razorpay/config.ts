import Razorpay from "razorpay";

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isLive: boolean;
  siteUrl: string;
  checkoutImage: string;
};

function cleanEnv(value: unknown) {
  return String(value || "").trim();
}

export function getRazorpayConfig():
  | { ok: true; config: RazorpayConfig }
  | { ok: false; message: string } {
  const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID);
  const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);
  const webhookSecret = cleanEnv(process.env.RAZORPAY_WEBHOOK_SECRET);
  const siteUrl = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "") ||
    "https://www.evuddy.com";
  const mode = cleanEnv(process.env.RAZORPAY_MODE).toLowerCase();

  if (!keyId || !keySecret) {
    return {
      ok: false,
      message: "Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.",
    };
  }

  if (!keyId.startsWith("rzp_live_") && !keyId.startsWith("rzp_test_")) {
    return {
      ok: false,
      message: "RAZORPAY_KEY_ID must start with rzp_live_ (or rzp_test_ only on local).",
    };
  }

  const isLive = keyId.startsWith("rzp_live_");
  const mustBeLive =
    mode === "live" ||
    process.env.NODE_ENV === "production" ||
    /evuddy\.com/i.test(siteUrl);

  if (mustBeLive && !isLive) {
    return {
      ok: false,
      message:
        "www.evuddy.com cannot take test payments. Put the live Razorpay key (rzp_live_...) in .env on this machine and on the EC2 server.",
    };
  }

  return {
    ok: true,
    config: {
      keyId,
      keySecret,
      webhookSecret,
      isLive,
      siteUrl,
      checkoutImage: `${siteUrl}/Evuddy-logo-dark-E.png`,
    },
  };
}

export function getRazorpayClient() {
  const loaded = getRazorpayConfig();
  if (!loaded.ok) {
    throw new Error(loaded.message);
  }

  return new Razorpay({
    key_id: loaded.config.keyId,
    key_secret: loaded.config.keySecret,
  });
}
