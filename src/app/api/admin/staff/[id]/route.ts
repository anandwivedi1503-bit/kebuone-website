import { NextResponse } from "next/server";

import {
  denyStaffDeletes,
  getAdminSession,
  hashStaffPassword,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { STAFF_DASHBOARDS } from "@/lib/adminRoles";
import { connectDB } from "@/lib/mongodb";
import AdminStaff from "@/models/AdminStaff";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "Only super admin can update team members." },
      { status: 403 }
    );
  }

  await connectDB();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (typeof body.displayName === "string") {
    update.displayName = body.displayName.trim().slice(0, 80);
  }
  if (typeof body.isActive === "boolean") {
    update.isActive = body.isActive;
  }
  if (Array.isArray(body.dashboards)) {
    const dashboards = body.dashboards.filter((item: string) =>
      STAFF_DASHBOARDS.includes(item)
    );
    if (dashboards.length === 0) {
      return NextResponse.json(
        { success: false, message: "Select at least one dashboard." },
        { status: 400 }
      );
    }
    update.dashboards = dashboards;
  }
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const hashed = hashStaffPassword(body.password);
    update.passwordHash = hashed.passwordHash;
    update.passwordSalt = hashed.passwordSalt;
  }

  const revokeSession =
    typeof body.isActive === "boolean" ||
    Array.isArray(body.dashboards) ||
    (typeof body.password === "string" && body.password.length > 0);

  const staff = await AdminStaff.findByIdAndUpdate(
    id,
    revokeSession ? { $set: update, $inc: { sessionVersion: 1 } } : { $set: update },
    { new: true }
  )
    .select("-passwordHash -passwordSalt")
    .lean();

  if (!staff) {
    return NextResponse.json(
      { success: false, message: "Staff member not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: staff });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = await denyStaffDeletes();
  if (blocked) return blocked;

  await connectDB();
  const { id } = await params;
  await AdminStaff.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
