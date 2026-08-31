import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { readGoogleMapsApiKey } from "@/lib/mapsConfig";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  const gate = await requireAdminDashboards(...API_DASHBOARDS.iot);
  if (gate.error) return gate.error;

  const apiKey = readGoogleMapsApiKey();

  return NextResponse.json({
    success: true,
    configured: Boolean(apiKey),
    apiKey,
  });
}
