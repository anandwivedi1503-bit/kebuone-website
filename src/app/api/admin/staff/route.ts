import { NextResponse } from "next/server";

import {
  denyStaffDeletes,
  getAdminSession,
  hashStaffPassword,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { STAFF_DASHBOARDS } from "@/lib/adminRoles";
import { connectDB } from "@/lib/mongodb";
import { normalizeHubCodes } from "@/lib/staffHubScope";
import AdminStaff from "@/models/AdminStaff";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function GET() {
  const blocked = await denyStaffDeletes();
  if (blocked) return blocked;

  await connectDB();
  const staff = await AdminStaff.find()
    .select("-passwordHash -passwordSalt -totpSecret")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: staff });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "Only super admin can add team members." },
      { status: 403 }
    );
  }

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const username = clean(body.username).toLowerCase();
  const password = String(body.password || "");
  const displayName = clean(body.displayName);
  const dashboards = Array.isArray(body.dashboards)
    ? body.dashboards.filter((id: string) => STAFF_DASHBOARDS.includes(id))
    : [];
  const hubs = normalizeHubCodes(body.hubs);
  const staffRole = body.staffRole === "super" ? "super" : "staff";

  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    return NextResponse.json(
      { success: false, message: "Username must be 3-40 letters, numbers, dot, dash or underscore." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  if (staffRole !== "super" && dashboards.length === 0) {
    return NextResponse.json(
      { success: false, message: "Select at least one dashboard." },
      { status: 400 }
    );
  }

  const exists = await AdminStaff.findOne({ username }).lean();
  if (exists) {
    return NextResponse.json(
      { success: false, message: "That username already exists." },
      { status: 409 }
    );
  }

  const { passwordHash, passwordSalt } = hashStaffPassword(password);
  const created = await AdminStaff.create({
    username,
    displayName: displayName || username,
    passwordHash,
    passwordSalt,
    dashboards: staffRole === "super" ? [] : dashboards,
    hubs: staffRole === "super" ? [] : hubs,
    staffRole,
    isActive: true,
    sessionVersion: 0,
  });

  return NextResponse.json({
    success: true,
    data: {
      _id: created._id,
      username: created.username,
      displayName: created.displayName,
      dashboards: created.dashboards,
      hubs: created.hubs,
      staffRole: created.staffRole,
      totpEnabled: created.totpEnabled,
      isActive: created.isActive,
    },
  });
}
