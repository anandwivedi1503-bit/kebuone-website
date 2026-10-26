import { downloadHtmlFile } from "@/lib/dashboardExport";

export function downloadTransactionInvoice(txn: {
  transactionId: string;
  bookingId?: string;
  userName?: string;
  amount?: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  transactionType?: string;
  status?: string;
  createdAt?: string;
  remarks?: string;
}) {
  const invoice =
    txn.invoiceNumber ||
    (String(txn.transactionType || "").toLowerCase() === "refund"
      ? `INV-RF-${txn.transactionId.replace(/^RF-/, "")}`
      : `INV-${txn.transactionId}`);
  const amount = Number(txn.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const when = txn.createdAt
    ? new Date(txn.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : "-";
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice}</title>
<style>body{font-family:Arial,sans-serif;padding:28px;color:#0f172a;max-width:720px;margin:0 auto}h1{color:#18B368;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td{border-bottom:1px solid #e5e7eb;padding:10px 0}td:first-child{font-weight:700;width:40%;color:#475569}</style></head><body>
<p style="font-weight:700;color:#18B368">EVUDDY · SMART ELECTRIC MOBILITY</p>
<h1>Payment invoice</h1>
<table>
<tr><td>Invoice</td><td>${invoice}</td></tr>
<tr><td>Transaction ID</td><td>${txn.transactionId}</td></tr>
<tr><td>Booking ID</td><td>${txn.bookingId || "-"}</td></tr>
<tr><td>Customer</td><td>${txn.userName || "-"}</td></tr>
<tr><td>Type</td><td>${txn.transactionType || "-"}</td></tr>
<tr><td>Amount</td><td>₹${amount}</td></tr>
<tr><td>Method</td><td>${txn.paymentMethod || "-"}</td></tr>
<tr><td>Status</td><td>${txn.status || "-"}</td></tr>
<tr><td>Date (IST)</td><td>${when}</td></tr>
</table>
${txn.remarks ? `<p style="margin-top:20px;font-size:13px;color:#64748b">${txn.remarks}</p>` : ""}
</body></html>`;
  downloadHtmlFile(`EVUDDY-invoice-${invoice}.html`, html);
}
