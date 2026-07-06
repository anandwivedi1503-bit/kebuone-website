import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "kebu_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

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

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const nonce = crypto.randomBytes(24).toString("hex");
  const payload = `${expiresAt}.${nonce}`;

  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSessionToken(token?: string) {
  if (!token) return false;

  const [expiresAt, nonce, signature] = token.split(".");
  if (!expiresAt || !nonce || !signature || !/^\d+$/.test(expiresAt)) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  return safeEqual(sign(`${expiresAt}.${nonce}`), signature);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
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