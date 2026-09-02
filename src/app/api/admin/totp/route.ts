import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { generateTotpSecret, totpMatches, totpOtpauthUrl } from "@/lib/totp";
import AdminStaff from "@/models/AdminStaff";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.username === "superadmin") {
    return NextResponse.json(
      {
        success: false,
        message: "Create a named super login in Team access, then enroll 2FA on that user. The shared env password stays as emergency bootstrap only.",
      },
      { status: 400 }
    );
  }

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "start");
  const staff = await AdminStaff.findOne({ username: session.username, isActive: true });
  if (!staff) return unauthorizedResponse();

  if (action === "start") {
    const secret = generateTotpSecret();
    staff.totpSecret = secret;
    staff.totpEnabled = false;
    await staff.save();
    return NextResponse.json({
      success: true,
      secret,
      otpauthUrl: totpOtpauthUrl(staff.username, secret),
    });
  }

  if (action === "confirm") {
    if (!totpMatches(String(staff.totpSecret || ""), body.code)) {
      return NextResponse.json(
        { success: false, message: "Invalid authenticator code." },
        { status: 400 }
      );
    }
    staff.totpEnabled = true;
    await staff.save();
    return NextResponse.json({ success: true, totpEnabled: true });
  }

  if (action === "disable") {
    if (!totpMatches(String(staff.totpSecret || ""), body.code)) {
      return NextResponse.json(
        { success: false, message: "Invalid authenticator code." },
        { status: 400 }
      );
    }
    staff.totpEnabled = false;
    staff.totpSecret = "";
    await staff.save();
    return NextResponse.json({ success: true, totpEnabled: false });
  }

  return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
}
