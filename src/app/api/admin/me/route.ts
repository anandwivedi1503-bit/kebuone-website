import { NextResponse } from "next/server";
import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();

  return NextResponse.json({
    success: true,
    data: session,
  });
}
