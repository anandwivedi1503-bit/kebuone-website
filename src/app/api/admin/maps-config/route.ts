import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { readGoogleMapsApiKey } from "@/lib/mapsConfig";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  const apiKey = readGoogleMapsApiKey();

  return NextResponse.json({
    success: true,
    configured: Boolean(apiKey),
    apiKey,
  });
}
