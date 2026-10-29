import { connectDB } from "@/lib/mongodb";
import { notifyBookingPayment } from "@/lib/notify/bookingNotify";
import { gstBreakdownInclusive } from "@/lib/gst";
import Transaction from "@/models/Transaction";
import Booking from "@/models/Booking";

function env(name: string) {
  return String(process.env[name] || "").trim();
}

export type DeliverReceiptInput = {
  bookingId: string;
  bookingMongoId?: string;
  email?: string;
  phone?: string;
  amount?: number;
};

async function sendDetailedEmail(opts: {
  to: string;
  bookingId: string;
  riderName: string;
  amount: number;
  paymentMethod: string;
  invoiceNumber: string;
  transactionId: string;
  gst: ReturnType<typeof gstBreakdownInclusive>;
}) {
  const resend = env("RESEND_API_KEY");
  const from = env("NOTIFY_FROM_EMAIL") || "EVUDDY <noreply@evuddy.com>";
  if (!resend) return false;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;color:#0f172a">
<p style="color:#18B368;font-weight:800;letter-spacing:.12em;font-size:11px">EVUDDY PAYMENT RECEIPT</p>
<h1 style="font-size:22px">₹${opts.amount.toLocaleString("en-IN")} received</h1>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Booking</td><td>${opts.bookingId}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Rider</td><td>${opts.riderName}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Method</td><td>${opts.paymentMethod}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Invoice</td><td>${opts.invoiceNumber || "—"}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Transaction</td><td>${opts.transactionId || "—"}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">Taxable</td><td>₹${opts.gst.taxableAmount.toFixed(2)}</td></tr>
<tr><td style="padding:8px 0;font-weight:700;color:#64748b">GST (5%)</td><td>₹${opts.gst.gstAmount.toFixed(2)}</td></tr>
</table>
<p style="font-size:12px;color:#64748b;margin-top:20px">Same record as evuddy.com admin CRM · helpdesk@kebuone.in</p>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: `EVUDDY receipt · ${opts.bookingId} · ₹${opts.amount}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deliverPaymentReceipt(input: DeliverReceiptInput) {
  await connectDB();
  const bookingId = String(input.bookingId || "").trim();
  const txnRaw = bookingId
    ? await Transaction.findOne({ bookingId }).sort({ createdAt: -1 }).lean()
    : null;
  const txn = txnRaw && !Array.isArray(txnRaw) ? txnRaw : null;
  const bookingRaw = bookingId
    ? await Booking.findOne({ bookingId }).select("userName userPhone userEmail").lean()
    : null;
  const booking = bookingRaw && !Array.isArray(bookingRaw) ? bookingRaw : null;

  const amount = Number(input.amount || txn?.amount || 0);
  const riderName = String(booking?.userName || "Rider");
  const riderPhone = String(input.phone || booking?.userPhone || "").slice(-10);
  const riderEmail = String(input.email || booking?.userEmail || "").trim();
  const paymentMethod = String(txn?.paymentMethod || "Razorpay");
  const invoiceNumber = String(txn?.invoiceNumber || "");
  const transactionId = String(txn?.transactionId || "");
  const gst = gstBreakdownInclusive(amount);

  const channels: string[] = [];

  if (riderEmail) {
    const ok = await sendDetailedEmail({
      to: riderEmail,
      bookingId,
      riderName,
      amount,
      paymentMethod,
      invoiceNumber,
      transactionId,
      gst,
    });
    if (ok) channels.push("email");
  }

  const notify = await notifyBookingPayment({
    bookingId,
    riderName,
    riderPhone,
    riderEmail,
    amount,
    pendingAmount: 0,
    paymentStatus: "Paid",
    paymentMethod: paymentMethod.includes("Wallet") ? "Wallet" : "Razorpay",
    invoiceNumber,
  });
  if (notify.sms) channels.push("SMS");
  if (notify.email && !channels.includes("email")) channels.push("email");

  return {
    success: channels.length > 0,
    channels: [...new Set(channels)],
    emailSent: channels.includes("email"),
    smsSent: channels.includes("SMS"),
  };
}
