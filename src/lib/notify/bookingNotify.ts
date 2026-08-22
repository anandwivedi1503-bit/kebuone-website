function env(name: string) {
  return String(process.env[name] || "").trim();
}

export type BookingNotifyInput = {
  bookingId: string;
  riderName?: string;
  riderPhone?: string;
  riderEmail?: string;
  amount: number;
  pendingAmount: number;
  paymentStatus: string;
  pickupOTP?: string;
  paymentMethod: "Razorpay" | "Wallet";
};

function messageFor(input: BookingNotifyInput) {
  const otpLine = input.pickupOTP
    ? ` Pickup OTP: ${input.pickupOTP}. Show this at the hub.`
    : input.pendingAmount > 0
      ? ` Pending: INR ${input.pendingAmount}.`
      : "";
  return `EVUDDY booking ${input.bookingId} is ${input.paymentStatus}. Paid INR ${input.amount} via ${input.paymentMethod}.${otpLine} https://www.evuddy.com/book-bike`;
}

async function sendEmail(input: BookingNotifyInput, text: string) {
  const to = String(input.riderEmail || "").trim();
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  if (!to || !resend) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resend}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.pickupOTP
        ? `EVUDDY booking ${input.bookingId} — pickup OTP`
        : `EVUDDY booking ${input.bookingId} payment`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

async function sendSms(input: BookingNotifyInput, text: string) {
  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  if (!phone) return;

  const msg91 = env("MSG91_AUTH_KEY");
  const twilioSid = env("TWILIO_ACCOUNT_SID");
  const twilioToken = env("TWILIO_AUTH_TOKEN");
  const twilioFrom = env("TWILIO_FROM_NUMBER");

  if (msg91) {
    const templateId = env("MSG91_TEMPLATE_ID");
    if (templateId) {
      const res = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: msg91,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: templateId,
          recipients: [
            {
              mobiles: `91${phone}`,
              booking: input.bookingId,
              otp: input.pickupOTP || "",
              status: input.paymentStatus,
            },
          ],
        }),
      });
      if (res.ok) return;
    }
    const simple = await fetch(
      `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(msg91)}&mobiles=91${phone}&message=${encodeURIComponent(text.slice(0, 300))}&sender=${encodeURIComponent(env("MSG91_SENDER_ID") || "EVUDDY")}&route=4&country=91`
    );
    if (!simple.ok) throw new Error("msg91");
    return;
  }

  if (twilioSid && twilioToken && twilioFrom) {
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `+91${phone}`,
          From: twilioFrom,
          Body: text.slice(0, 320),
        }),
      }
    );
    if (!res.ok) throw new Error(`twilio sms ${res.status}`);
  }
}

async function sendWhatsApp(input: BookingNotifyInput, text: string) {
  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  const twilioSid = env("TWILIO_ACCOUNT_SID");
  const twilioToken = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_WHATSAPP_FROM");
  if (!phone || !twilioSid || !twilioToken || !from) return;

  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:+91${phone}`,
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        Body: text.slice(0, 1000),
      }),
    }
  );
  if (!res.ok) throw new Error(`twilio whatsapp ${res.status}`);
}

export async function notifyBookingPayment(input: BookingNotifyInput) {
  try {
    const text = messageFor(input);
    await Promise.allSettled([
      sendEmail(input, text),
      sendSms(input, text),
      sendWhatsApp(input, text),
    ]);
  } catch (error) {
    console.error("BOOKING NOTIFY SKIPPED:", error);
  }
}
