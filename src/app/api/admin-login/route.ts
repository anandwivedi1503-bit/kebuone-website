import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  hashStaffPassword,
  SESSION_COOKIE_NAME,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import AdminStaff from "@/models/AdminStaff";

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
  const ip = clientIp(req);

  if (!rateLimitAllowed(`admin-login:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, message: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const forwardedFor =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown";
  const userAgent = req.headers.get("user-agent") || "Unknown";
  const password = String(body.password || "");
  const username = String(body.username || "")
    .trim()
    .toLowerCase();
  const adminPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!adminPassword || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { success: false, message: "Admin auth is not configured." },
      { status: 500 }
    );
  }

  if (safeCompare(password, adminPassword)) {
    const response = NextResponse.json({
      success: true,
      role: "super",
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createAdminSessionToken({
        role: "super",
        username: "superadmin",
        dashboards: [],
      }),
      getAdminSessionCookieOptions()
    );
    return response;
  }

  if (username) {
    try {
      await connectDB();
      const staff = await AdminStaff.findOne({ username, isActive: true });
      if (staff) {
        const { passwordHash } = hashStaffPassword(password, staff.passwordSalt);
        if (safeCompare(passwordHash, staff.passwordHash)) {
          const response = NextResponse.json({
            success: true,
            role: "staff",
          });
          response.cookies.set(
            SESSION_COOKIE_NAME,
            createAdminSessionToken({
              role: "staff",
              username: staff.username,
              dashboards: staff.dashboards || [],
            }),
            getAdminSessionCookieOptions()
          );
          return response;
        }
      }
    } catch (error) {
      console.warn("[ADMIN STAFF LOGIN ERROR]", error);
    }
  }

  console.warn(
    `[ADMIN LOGIN FAILED] IP=${forwardedFor} Browser=${userAgent}`
  );
  return NextResponse.json(
    { success: false, message: "Invalid credentials." },
    { status: 401 }
  );
}
