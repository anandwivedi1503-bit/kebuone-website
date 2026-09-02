import { NextResponse } from "next/server";

import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { getRazorpayClient, getRazorpayConfig } from "@/lib/razorpay/config";
import Transaction from "@/models/Transaction";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireAdminDashboards(...API_DASHBOARDS.transactions);
  if (gate.error) return gate.error;

  const loaded = getRazorpayConfig();
  if (!loaded.ok) {
    return NextResponse.json(
      { success: false, message: loaded.message, skipped: true },
      { status: 200 }
    );
  }

  await connectDB();
  const from = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  const razorpay = getRazorpayClient();
  const captured: Array<{ id: string; amount: number; status: string }> = [];

  try {
    for (let skip = 0; skip < 500; skip += 100) {
      const page = (await razorpay.payments.all({
        from,
        count: 100,
        skip,
      })) as { items?: Array<{ id?: string; amount?: number; status?: string }> };
      const items = page.items || [];
      for (const item of items) {
        if (item.status === "captured" && item.id) {
          captured.push({
            id: String(item.id),
            amount: Number(item.amount || 0) / 100,
            status: String(item.status),
          });
        }
      }
      if (items.length < 100) break;
    }
  } catch (error) {
    console.error("RAZORPAY RECON FETCH:", error);
    return NextResponse.json(
      { success: false, message: "Could not read Razorpay payments." },
      { status: 502 }
    );
  }

  const ids = captured.map((row) => row.id);
  const inMongo = ids.length
    ? await Transaction.find({
        $or: [{ razorpayPaymentId: { $in: ids } }, { transactionId: { $in: ids } }],
      })
        .select("razorpayPaymentId transactionId amount")
        .lean()
    : [];
  const seen = new Set(
    inMongo.flatMap((row) =>
      [row.razorpayPaymentId, row.transactionId].map((id) => String(id || ""))
    )
  );
  const missingInMongo = captured.filter((row) => !seen.has(row.id));

  return NextResponse.json({
    success: true,
    windowHours: 24,
    scannedUpTo: 500,
    razorpayCaptured: captured.length,
    missingInMongo: missingInMongo.slice(0, 50),
    missingCount: missingInMongo.length,
    ok: missingInMongo.length === 0,
  });
}
