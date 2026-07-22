import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ riderId: string }> }
) {
  try {
    await connectDB();

    const { riderId } = await params;

    const rider = await Rider.findOne({
      riderId,
    }).select(
      "riderId fullName phone bookingEnabled approvalStatus kycStatus activeRide"
    );

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rider,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}