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
  rideEndOTP?: string;
  paymentMethod: "Razorpay" | "Wallet" | "Cash";
};

function messageFor(input: BookingNotifyInput) {
  const otpLine = input.rideEndOTP
    ? ` Ride end OTP: ${input.rideEndOTP}. Tell this to the yard when you return the scooter.`
    : input.pickupOTP
    ? ` Pickup OTP: ${input.pickupOTP}. Show this at the hub.`
    : input.pendingAmount > 0
      ? ` Pending: INR ${input.pendingAmount}. Pay remaining before ride end OTP is issued.`
      : "";
  return `EVUDDY booking ${input.bookingId} is ${input.paymentStatus}. Paid INR ${input.amount} via ${input.paymentMethod}.${otpLine} https://www.evuddy.com/book-bike`;
}

function smsBodyFor(input: BookingNotifyInput) {
  if (input.pickupOTP && input.rideEndOTP) {
    return `EVUDDY ${input.bookingId} Pickup OTP ${input.pickupOTP}. Ride end OTP ${input.rideEndOTP}. Tell the yard.`;
  }
  if (input.rideEndOTP) {
    return `EVUDDY Ride End OTP ${input.rideEndOTP} for ${input.bookingId}. Tell the yard to return the scooter.`;
  }
  if (input.pickupOTP) {
    return `EVUDDY Pickup OTP ${input.pickupOTP} for ${input.bookingId}. Tell the yard to unlock.`;
  }
  return messageFor(input).slice(0, 300);
}

async function sendEmail(input: BookingNotifyInput, text: string) {
  const to = String(input.riderEmail || "").trim();
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  if (!to || !resend) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resend}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.rideEndOTP
        ? `EVUDDY ride end OTP ${input.bookingId}`
        : input.pickupOTP
        ? `EVUDDY pickup OTP ${input.bookingId}`
        : `EVUDDY booking ${input.bookingId} payment`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
  return true;
}

function msg91Failed(body: string) {
  const text = body.toLowerCase();
  return (
    text.includes("error") ||
    text.includes("invalid") ||
    text.includes("missing") ||
    text.includes("fail") ||
    text.includes("dlt")
  );
}

async function sendSms(input: BookingNotifyInput) {
  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  if (!phone || phone.length !== 10) {
    console.error("BOOKING SMS SKIPPED: no 10-digit registered phone");
    return false;
  }

  const smsBody = smsBodyFor(input);
  const msg91 = env("MSG91_AUTH_KEY");
  const twilioSid = env("TWILIO_ACCOUNT_SID");
  const twilioToken = env("TWILIO_AUTH_TOKEN");
  const twilioFrom = env("TWILIO_FROM_NUMBER");
  const fast2sms = env("FAST2SMS_API_KEY");

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
              otp: input.rideEndOTP || input.pickupOTP || "",
              status: input.paymentStatus,
            },
          ],
        }),
      });
      const body = await res.text();
      if (res.ok && !msg91Failed(body)) return true;
      console.error("MSG91 FLOW SMS FAILED:", res.status, body.slice(0, 200));
    }
    const simple = await fetch(
      `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(msg91)}&mobiles=91${phone}&message=${encodeURIComponent(smsBody)}&sender=${encodeURIComponent(env("MSG91_SENDER_ID") || "EVUDDY")}&route=4&country=91`
    );
    const simpleBody = await simple.text();
    if (simple.ok && !msg91Failed(simpleBody)) return true;
    console.error("MSG91 HTTP SMS FAILED:", simple.status, simpleBody.slice(0, 200));
  }

  if (fast2sms) {
    const otpValue = String(input.pickupOTP || input.rideEndOTP || "").trim();
    if (otpValue && /^\d{4,8}$/.test(otpValue) && !(input.pickupOTP && input.rideEndOTP)) {
      const otpRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2sms,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otpValue,
          numbers: phone,
        }),
      });
      const otpBody = await otpRes.text();
      if (otpRes.ok && !/false|error|invalid/i.test(otpBody)) return true;
      console.error("FAST2SMS OTP FAILED:", otpRes.status, otpBody.slice(0, 200));
    }
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: fast2sms,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: smsBody,
        language: "english",
        flash: 0,
        numbers: phone,
      }),
    });
    const body = await res.text();
    if (res.ok && !/false|error|invalid/i.test(body)) return true;
    console.error("FAST2SMS FAILED:", res.status, body.slice(0, 200));
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
          Body: smsBody.slice(0, 320),
        }),
      }
    );
    if (res.ok) return true;
    console.error("TWILIO SMS FAILED:", res.status, (await res.text()).slice(0, 200));
  }

  if (!msg91 && !fast2sms && !(twilioSid && twilioToken && twilioFrom)) {
    console.error(
      "BOOKING SMS SKIPPED: set MSG91_AUTH_KEY, FAST2SMS_API_KEY, or Twilio SMS keys on the server."
    );
  }
  return false;
}

async function sendWhatsApp(input: BookingNotifyInput, text: string) {
  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  const twilioSid = env("TWILIO_ACCOUNT_SID");
  const twilioToken = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_WHATSAPP_FROM");
  if (!phone || !twilioSid || !twilioToken || !from) return false;

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
  if (!res.ok) {
    console.error("TWILIO WHATSAPP FAILED:", res.status);
    return false;
  }
  return true;
}

export async function notifyBookingPayment(input: BookingNotifyInput) {
  const text = messageFor(input);
  const [email, sms, whatsapp] = await Promise.allSettled([
    sendEmail(input, text),
    sendSms(input),
    sendWhatsApp(input, text),
  ]);
  if (sms.status === "rejected") {
    console.error("BOOKING SMS ERROR:", sms.reason);
  }
  return {
    email: email.status === "fulfilled" && Boolean(email.value),
    sms: sms.status === "fulfilled" && Boolean(sms.value),
    whatsapp: whatsapp.status === "fulfilled" && Boolean(whatsapp.value),
  };
}
