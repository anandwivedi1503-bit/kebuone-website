import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Battery from "@/models/Battery";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

   const batteries = await Battery.find().sort({
  createdAt: -1,
});

    return NextResponse.json({
      success: true,
      data: batteries,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
    });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const body = await req.json();

    const existing = await Battery.findOne({
  batteryId: body.batteryId,
});

if (existing) {
  return NextResponse.json(
    {
      success: false,
      message: "Battery ID already exists.",
    },
    { status: 409 }
  );
}

    const battery = await Battery.create(body);

    return NextResponse.json({
      success: true,
      data: battery,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
    });
  }
}