import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Partner from "@/models/Partner";

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

    const updateData: Record<string, unknown> = {};

if (body.applicationStatus !== undefined) {
  updateData.applicationStatus = body.applicationStatus;
}

if (body.applicationStage !== undefined) {
  updateData.applicationStage = body.applicationStage;
}

if (body.assignedManager !== undefined) {
  updateData.assignedManager = body.assignedManager;
}

if (body.priority !== undefined) {
  updateData.priority = body.priority;
}

if (body.followUpDate !== undefined) {
  updateData.followUpDate = body.followUpDate;
}

if (body.meetingDate !== undefined) {
  updateData.meetingDate = body.meetingDate;
}

if (body.meetingNotes !== undefined) {
  updateData.meetingNotes = body.meetingNotes;
}

if (body.adminRemarks !== undefined) {
  updateData.adminRemarks = body.adminRemarks;
}
if (body.documentStatus !== undefined) {
  updateData.documentStatus = body.documentStatus;
}

updateData.reviewedDate = new Date();

const partner = await Partner.findByIdAndUpdate(
  id,
  updateData,
  {
    new: true,
    runValidators: true,
  }
);

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
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
    await connectDB();

    const { id } = await params;

    await Partner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}