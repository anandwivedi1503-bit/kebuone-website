import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { readBrowserGoogleMapsApiKey } from "@/lib/mapsConfig";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  const gate = await requireAdminDashboards(...API_DASHBOARDS.iot);
  if (gate.error) return gate.error;

  const apiKey = readBrowserGoogleMapsApiKey();

  return NextResponse.json({
    success: true,
    configured: Boolean(apiKey),
    apiKey,
  });
}
