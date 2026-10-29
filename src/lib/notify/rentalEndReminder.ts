import { notifyOpsAlert } from "@/lib/notify/opsAlert";

function env(name: string) {
  return String(process.env[name] || "").trim();
}

export type RentalEndReminderInput = {
  bookingId: string;
  riderName?: string;
  riderPhone?: string;
  riderEmail?: string;
  endsAtIso?: string;
  duration?: string;
  units?: number;
  leadMinutes?: number;
};

function formatIst(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return iso;
  }
}

async function sendSms(phone10: string, message: string) {
  const fast2sms = env("FAST2SMS_API_KEY");
  if (fast2sms) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2sms,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: message.slice(0, 300),
          language: "english",
          numbers: phone10,
        }),
      });
      if (res.ok) return true;
    } catch {
      /* fall through */
    }
  }
  const msg91 = env("MSG91_AUTH_KEY");
  if (msg91) {
    try {
      const res = await fetch(
        `https://control.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(msg91)}&mobiles=91${phone10}&message=${encodeURIComponent(message.slice(0, 300))}&sender=EVUDDY&route=4&country=91`,
        { method: "GET" }
      );
      if (res.ok) return true;
    } catch {
      /* fall through */
    }
  }
  return false;
}

async function sendEmail(to: string, subject: string, text: string) {
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  if (!to || !resend) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyRentalEndReminder(input: RentalEndReminderInput) {
  const ends = input.endsAtIso ? formatIst(input.endsAtIso) : "soon";
  const plan =
    input.duration && input.units
      ? `${input.duration} (${input.units} units)`
      : input.duration || "rental";
  const smsText = `EVUDDY ALERT: Booking ${input.bookingId} (${plan}) ends around ${ends}. Return the scooter on time. Help: 8726006512`;
  const emailText = `Hello ${input.riderName || "rider"},\n\nYour EVUDDY booking ${input.bookingId} (${plan}) is scheduled to end around ${ends} (IST).\n\nPlease plan your return to the hub.\n\n— EVUDDY\nhelpdesk@kebuone.in · +91 8726006512`;

  const phone = String(input.riderPhone || "").replace(/\D/g, "").slice(-10);
  const email = String(input.riderEmail || "").trim();

  const [smsSent, emailSent] = await Promise.all([
    phone.length === 10 ? sendSms(phone, smsText) : Promise.resolve(false),
    email ? sendEmail(email, `EVUDDY · ${input.bookingId} ending soon`, emailText) : Promise.resolve(false),
  ]);

  await notifyOpsAlert(
    `Booking ${input.bookingId} · ~${input.leadMinutes || 60} min to end`,
    `${plan} · ${input.riderName || "rider"} · +91${phone || "—"} · ends ${ends}`
  );

  return { emailSent, smsSent, email: emailSent, sms: smsSent };
}
