import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";

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

    const rider = await Rider.findById(id);

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    if (
  rider.activeRide &&
  body.approvalStatus === "Rejected"
) {
  return NextResponse.json(
    {
      success: false,
      message: "Cannot reject rider while a ride is active.",
    },
    { status: 400 }
  );
}

    // Only allow these fields to be updated
    if (body.approvalStatus) {
      rider.approvalStatus = body.approvalStatus;
    }

    if (body.status) {
  rider.status = body.status;
}

    if (body.kycStatus) {
      rider.kycStatus = body.kycStatus;
    }

    if (body.rejectedReason !== undefined) {
      rider.rejectedReason = body.rejectedReason;
    }

    if (body.approvedBy) {
      rider.approvedBy = body.approvedBy;
    }

         if (
  body.approvalStatus === "Approved" &&
  !rider.approvedAt
) {
  rider.approvedAt = new Date();
}

    if (body.activeRide !== undefined) {
  rider.activeRide = body.activeRide;
}

    // Automatically activate rider after approval
    if (
  rider.approvalStatus === "Approved" &&
  rider.kycStatus === "Approved"
) {
  rider.status = "Active";
  rider.bookingEnabled = true;
  rider.rejectedReason = "";

rider.blacklisted = false;

rider.blacklistReason = "";
} else if (rider.status === "Suspended") {
  rider.bookingEnabled = false;
  rider.activeRide = false;
  rider.currentBookingId = "";

} else {
  rider.status = "Blocked";

  rider.bookingEnabled = false;

  rider.activeRide = false;

  rider.currentBookingId = "";
}

    await rider.save();

    return NextResponse.json({
      success: true,
      message: "Rider updated successfully.",
      data: rider,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update rider.",
      },
      { status: 500 }
    );
  }
}