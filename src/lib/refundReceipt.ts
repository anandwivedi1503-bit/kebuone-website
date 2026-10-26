import { downloadHtmlFile } from "@/lib/dashboardExport";

export type RefundReceiptInput = {
  refundId: string;
  bookingId: string;
  riderId?: string;
  userName?: string;
  amount: number;
  paymentGateway?: string;
  gatewayTxnId?: string;
  razorpayRefundId?: string;
  processedAt?: string | Date;
};

export function refundReceiptHtml(input: RefundReceiptInput) {
  const processed =
    input.processedAt
      ? new Date(input.processedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const amount = Number(input.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const invoice = `INV-RF-${input.refundId}`;
  const rows: Array<[string, string]> = [
    ["Invoice", invoice],
    ["Refund ID", input.refundId],
    ["Booking ID", input.bookingId],
    ["Rider ID", input.riderId || "-"],
    ["Rider name", input.userName || "-"],
    ["Amount refunded", `₹${amount}`],
    ["Channel", input.paymentGateway || "Razorpay"],
    ["Gateway reference", input.gatewayTxnId || input.razorpayRefundId || "-"],
    ["Razorpay refund ID", input.razorpayRefundId || "-"],
    ["Processed at (IST)", processed],
  ];
  return `<!doctype html><html><head><meta charset="utf-8"><title>EVUDDY refund ${input.refundId}</title>
<style>body{font-family:Arial,sans-serif;padding:28px;color:#0f172a;max-width:720px;margin:0 auto}h1{color:#18B368;font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}td{border-bottom:1px solid #e5e7eb;padding:10px 0;vertical-align:top}td:first-child{font-weight:700;width:40%;color:#475569}footer{margin-top:28px;font-size:12px;color:#64748b}</style></head><body>
<p style="font-weight:700;color:#18B368">EVUDDY · SMART ELECTRIC MOBILITY</p>
<h1>Refund payment slip</h1>
<table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</table>
<footer>This slip is generated from EVUDDY ops. Razorpay refunds return to the original payment method.</footer>
</body></html>`;
}

export function downloadRefundReceipt(input: RefundReceiptInput) {
  downloadHtmlFile(`EVUDDY-refund-${input.refundId}.html`, refundReceiptHtml(input));
}
