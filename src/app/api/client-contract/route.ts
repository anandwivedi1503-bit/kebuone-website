import { NextResponse } from "next/server";
import { paymentContract, registrationContract } from "@/lib/registrationContract";

export const dynamic = "force-dynamic";

/** Shared questions for the website and the app. Legacy app builds may ignore this. */
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
