import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/adminAuth";

function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(req: Request) {
  return clearSession(NextResponse.redirect(new URL("/admin-login", req.url)));
}

export async function POST() {
  return clearSession(NextResponse.json({ success: true }));
}