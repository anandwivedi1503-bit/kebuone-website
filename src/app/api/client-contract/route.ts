import { NextResponse } from "next/server";
import { paymentContract, registrationContract } from "@/lib/registrationContract";

export const dynamic = "force-dynamic";

/** Shared registration and payment rules used by website and app clients. */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      registration: registrationContract(),
      payment: paymentContract(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
