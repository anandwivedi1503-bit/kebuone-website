import { refundReceiptHtml } from "@/lib/refundReceipt";

function env(name: string) {
  return String(process.env[name] || "").trim();
}

export type RefundNotifyInput = {
  refundId: string;
  bookingId: string;
  riderName?: string;
  riderPhone?: string;
  riderEmail?: string;
  amount: number;
  paymentGateway?: string;
  gatewayTxnId?: string;
  razorpayRefundId?: string;
  isSecurityDeposit?: boolean;
};

async function sendRefundEmail(input: RefundNotifyInput) {
  const to = String(input.riderEmail || "").trim();
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  if (!to || !resend) return false;

  const html = refundReceiptHtml({
    refundId: input.refundId,
    bookingId: input.bookingId,
    userName: input.riderName,
    amount: input.amount,
    paymentGateway: input.paymentGateway || "Razorpay",
    gatewayTxnId: input.gatewayTxnId,
    razorpayRefundId: input.razorpayRefundId,
    processedAt: new Date(),
  });

  const subject = input.isSecurityDeposit
    ? `EVUDDY security deposit refund · ${input.bookingId}`
    : `EVUDDY refund receipt · ${input.bookingId}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resend}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: `EVUDDY refund ${input.refundId} for booking ${input.bookingId}. Amount INR ${input.amount}. Processed via ${input.paymentGateway || "Razorpay"} (Shubhrax Mobility Ltd).`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return true;
}

async function sendRefundSms(input: RefundNotifyInput) {
  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  const authKey = env("MSG91_AUTH_KEY");
  const templateId = env("MSG91_TEMPLATE_ID");
  if (!/^[6-9]\d{9}$/.test(phone) || !authKey) return false;

  const text = input.isSecurityDeposit
    ? `EVUDDY security deposit refund INR ${input.amount} for ${input.bookingId}. Ref ${input.refundId}. Via Shubhrax Mobility Razorpay.`
    : `EVUDDY refund INR ${input.amount} booking ${input.bookingId}. Ref ${input.refundId}.`;

  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId || undefined,
      short_url: "0",
      recipients: [{ mobiles: `91${phone}`, var: text.slice(0, 120) }],
    }),
  }).catch(() => null);

  if (!res?.ok) {
    const fallback = await fetch(
      `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(authKey)}&mobiles=91${phone}&message=${encodeURIComponent(text.slice(0, 160))}&sender=EVUDDY&route=4&country=91`
    );
    return fallback.ok;
  }
  return true;
}

export async function notifyRefundReceipt(input: RefundNotifyInput) {
  const [email, sms] = await Promise.allSettled([
    sendRefundEmail(input),
    sendRefundSms(input),
  ]);
  return {
    email: email.status === "fulfilled" && Boolean(email.value),
    sms: sms.status === "fulfilled" && Boolean(sms.value),
  };
}
