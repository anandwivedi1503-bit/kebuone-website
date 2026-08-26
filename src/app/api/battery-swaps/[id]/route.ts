import { denyStaffDeletes, isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BatterySwap from "@/models/BatterySwap";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const allowed: Record<string, unknown> = {};
    if (typeof body.staffId === "string") allowed.staffId = body.staffId.trim();
    if (typeof body.remarks === "string") allowed.remarks = body.remarks.trim().slice(0, 500);
    if (typeof body.updatedBy === "string") allowed.updatedBy = body.updatedBy.trim();

    const swap = await BatterySwap.findByIdAndUpdate(
      id,
      { $set: allowed },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: swap,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }
    const blockedDelete = await denyStaffDeletes();
    if (blockedDelete) return blockedDelete;

    await connectDB();

    const { id } = await params;

    const swap = await BatterySwap.findById(id);

if (!swap) {
  return NextResponse.json(
    {
      success: false,
      message: "Swap not found.",
    },
    { status: 404 }
  );
}

if (swap.status === "COMPLETED") {
  return NextResponse.json(
    {
      success: false,
      message:
        "Completed battery swaps cannot be deleted.",
    },
    { status: 400 }
  );
}

    await BatterySwap.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}