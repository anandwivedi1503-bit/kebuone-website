import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ALL_DASHBOARDS,
} from "@/lib/adminRoles";
import {
  createAdminSessionToken,
  createMfaPendingToken,
  getAdminSessionCookieOptions,
  hashStaffPassword,
  MFA_COOKIE_NAME,
  readMfaPendingUsername,
  SESSION_COOKIE_NAME,
} from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { totpMatches } from "@/lib/totp";
import { writeAudit } from "@/lib/writeAudit";
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

function sessionForStaff(staff: {
  username: string;
  dashboards?: string[];
  sessionVersion?: number;
  hubs?: string[];
  staffRole?: string;
}) {
  const namedSuper = staff.staffRole === "super";
  return createAdminSessionToken({
    role: namedSuper ? "super" : "staff",
    username: staff.username,
    dashboards: namedSuper ? [...ALL_DASHBOARDS] : staff.dashboards || [],
    sessionVersion: Number(staff.sessionVersion || 0),
    hubs: namedSuper ? [] : Array.isArray(staff.hubs) ? staff.hubs : [],
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!(await rateLimitAllowed(`admin-login:${ip}`, 8, 10 * 60 * 1000))) {
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
  const totp = String(body.totp || "").replace(/\s+/g, "");
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

  const cookieStore = await cookies();
  const pendingUser = readMfaPendingUsername(
    cookieStore.get(MFA_COOKIE_NAME)?.value
  );

  if (totp && pendingUser) {
    try {
      await connectDB();
      const staff = await AdminStaff.findOne({ username: pendingUser, isActive: true });
      if (staff?.totpEnabled && totpMatches(String(staff.totpSecret || ""), totp)) {
        const response = NextResponse.json({
          success: true,
          role: staff.staffRole === "super" ? "super" : "staff",
        });
        response.cookies.set(MFA_COOKIE_NAME, "", { ...getAdminSessionCookieOptions(), maxAge: 0 });
        response.cookies.set(
          SESSION_COOKIE_NAME,
          sessionForStaff(staff),
          getAdminSessionCookieOptions()
        );
        void writeAudit({
          actor: staff.username,
          action: "ADMIN_LOGIN",
          entity: "AdminStaff",
          entityId: staff.username,
          detail: "Named login with 2FA",
        });
        return response;
      }
    } catch (error) {
      console.warn("[ADMIN MFA ERROR]", error);
    }
    return NextResponse.json(
      { success: false, message: "Invalid authenticator code." },
      { status: 401 }
    );
  }

  if (safeCompare(password, adminPassword)) {
    const response = NextResponse.json({
      success: true,
      role: "super",
      bootstrap: true,
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
    void writeAudit({
      actor: "superadmin",
      action: "ADMIN_LOGIN",
      entity: "AdminStaff",
      entityId: "superadmin",
      detail: "Shared env password bootstrap",
    });
    return response;
  }

  if (username) {
    try {
      await connectDB();
      const staff = await AdminStaff.findOne({ username, isActive: true });
      if (staff) {
        const { passwordHash } = hashStaffPassword(password, staff.passwordSalt);
        if (safeCompare(passwordHash, staff.passwordHash)) {
          if (staff.totpEnabled) {
            const response = NextResponse.json({
              success: true,
              needsTotp: true,
            });
            response.cookies.set(
              MFA_COOKIE_NAME,
              createMfaPendingToken(staff.username),
              { ...getAdminSessionCookieOptions(), maxAge: 300 }
            );
            return response;
          }
          const response = NextResponse.json({
            success: true,
            role: staff.staffRole === "super" ? "super" : "staff",
          });
          response.cookies.set(
            SESSION_COOKIE_NAME,
            sessionForStaff(staff),
            getAdminSessionCookieOptions()
          );
          void writeAudit({
            actor: staff.username,
            action: "ADMIN_LOGIN",
            entity: "AdminStaff",
            entityId: staff.username,
            detail: "Named login",
          });
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
