import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const body = await req.json();

    const vehicle = await Vehicle.create(body);

    return NextResponse.json({
      success: true,
      data: vehicle,
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

export async function GET() {
  try {
    await connectDB();

    if (await isAdminAuthenticated()) {
      const vehicles = await Vehicle.find().sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        data: vehicles,
      });
    }

    const vehicles = await Vehicle.find({ vehicleStatus: "Available" })
      .select(
        "vehicleId registrationNumber vehicleType vehicleModel batteryType registrationType dailyRate weeklyRate monthlyRate securityDeposit batteryPercentage currentHub vehicleStatus"
      )
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vehicles.",
      },
      { status: 500 }
    );
  }
}