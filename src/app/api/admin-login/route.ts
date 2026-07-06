import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/adminAuth";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    crypto.timingSafeEqual(Buffer.alloc(rightBuffer.length), rightBuffer);
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!adminPassword || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { success: false, message: "Admin auth is not configured." },
      { status: 500 }
    );
  }

  if (!safeCompare(password, adminPassword)) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(
    SESSION_COOKIE_NAME,
    createAdminSessionToken(),
    getAdminSessionCookieOptions()
  );

  return response;
}