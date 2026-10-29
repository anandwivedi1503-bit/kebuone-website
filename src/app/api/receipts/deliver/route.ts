import { NextResponse } from "next/server";

import { deliverPaymentReceipt } from "@/lib/notify/paymentReceiptDeliver";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { getVerifiedFirebaseUser } from "@/lib/requestAuth";

export const runtime = "nodejs";

async function handle(req: Request) {
  const firebaseUser = await getVerifiedFirebaseUser(req);
  if (!firebaseUser) {
    return NextResponse.json(
      { success: false, message: "Sign in required." },
      { status: 401 }
    );
  }

  if (
    !(await rateLimitAllowed(`receipt-del:${firebaseUser.uid}`, 12, 10 * 60 * 1000)) ||
    !(await rateLimitAllowed(`receipt-del-ip:${clientIp(req)}`, 30, 10 * 60 * 1000))
  ) {
    return NextResponse.json(
      { success: false, message: "Too many receipt requests." },
      { status: 429 }
    );
  }

  const body = (await req.json()) as {
    bookingId?: string;
    bookingMongoId?: string;
    email?: string;
    phone?: string;
    amount?: number;
  };

  const result = await deliverPaymentReceipt({
    bookingId: String(body.bookingId || ""),
    bookingMongoId: String(body.bookingMongoId || ""),
    email: String(body.email || ""),
    phone: String(body.phone || ""),
    amount: Number(body.amount),
  });

  return NextResponse.json({
    success: result.success,
    channels: result.channels,
    emailSent: result.emailSent,
    smsSent: result.smsSent,
  });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (error) {
    console.error("RECEIPT DELIVER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to deliver receipt." },
      { status: 500 }
    );
  }
}
