import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL("/admin-login", req.url));

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}