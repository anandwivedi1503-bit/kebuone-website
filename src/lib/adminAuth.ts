import crypto from "crypto";
import { cookies } from "next/headers";

import { ALL_DASHBOARDS } from "@/lib/adminRoles";

export const SESSION_COOKIE_NAME = "kebu_admin_session";
export const SESSION_MAX_AGE_SECONDS =
  Number(process.env.ADMIN_SESSION_MAX_AGE || 60 * 60 * 8);

export type AdminRole = "super" | "staff";

export type AdminSessionInfo = {
  role: AdminRole;
  username: string;
  dashboards: string[];
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }

  return secret;
}

function sign(payload: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function hashStaffPassword(password: string, salt?: string) {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .scryptSync(password, usedSalt, 64)
    .toString("hex");
  return { passwordHash, passwordSalt: usedSalt };
}

export function createAdminSessionToken(info?: AdminSessionInfo) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const nonce = crypto.randomBytes(24).toString("hex");

  if (!info || info.role === "super") {
    const payload = `${expiresAt}.${nonce}`;
    return `${payload}.${sign(payload)}`;
  }

  const body = Buffer.from(JSON.stringify(info), "utf8").toString("base64url");
  const payload = `${expiresAt}.${nonce}.${body}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSessionToken(token?: string) {
  if (!token) return false;

  const parts = token.split(".");

  if (parts.length === 3) {
    const [expiresAt, nonce, signature] = parts;
    if (!expiresAt || !nonce || !signature || !/^\d+$/.test(expiresAt)) {
      return false;
    }
    if (Number(expiresAt) < Date.now()) return false;
    return safeEqual(sign(`${expiresAt}.${nonce}`), signature);
  }

  if (parts.length === 4) {
    const [expiresAt, nonce, body, signature] = parts;
    if (!expiresAt || !nonce || !body || !signature || !/^\d+$/.test(expiresAt)) {
      return false;
    }
    if (Number(expiresAt) < Date.now()) return false;
    return safeEqual(sign(`${expiresAt}.${nonce}.${body}`), signature);
  }

  return false;
}

export function readAdminSessionFromToken(
  token?: string
): AdminSessionInfo | null {
  if (!isValidAdminSessionToken(token)) return null;

  const parts = token!.split(".");
  if (parts.length === 3) {
    return {
      role: "super",
      username: "superadmin",
      dashboards: [...ALL_DASHBOARDS],
    };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(parts[2], "base64url").toString("utf8")
    ) as AdminSessionInfo;
    if (parsed.role !== "staff" || !Array.isArray(parsed.dashboards)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionInfo | null> {
  const cookieStore = await cookies();
  return readAdminSessionFromToken(
    cookieStore.get(SESSION_COOKIE_NAME)?.value
  );
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function denyStaffDeletes() {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super") return forbiddenResponse();
  return null;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function unauthorizedResponse() {
  return Response.json(
    {
      success: false,
      message: "Unauthorized admin request",
    },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return Response.json(
    {
      success: false,
      message: "Only super admin can delete records.",
    },
    { status: 403 }
  );
}
