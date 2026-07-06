import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "kebu_admin_session";

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

async function isValidSessionToken(token: string | undefined, secret: string) {
  if (!token || !secret) return false;

  const [expiresAt, nonce, signature] = token.split(".");
  if (!expiresAt || !nonce || !signature || !/^\d+$/.test(expiresAt)) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(signature),
    new TextEncoder().encode(`${expiresAt}.${nonce}`)
  );
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET || "";

  if (
    req.nextUrl.pathname.startsWith("/dashboard") &&
    !(await isValidSessionToken(token, secret))
  ) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};