import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Partner from "@/models/Partner";
const applicationStatuses = [
  "Pending",
  "Approved",
  "Rejected",
];

const priorities = [
  "High",
  "Medium",
  "Low",
];

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
    const existingPartner = await Partner.findById(id);

if (!existingPartner) {
  return NextResponse.json(
    {
      success: false,
      message: "Partner not found.",
    },
    { status: 404 }
  );
}

    if (
  body.applicationStatus &&
  !applicationStatuses.includes(
    body.applicationStatus
  )
) {
  return NextResponse.json(
    {
      success:false,
      message:"Invalid application status.",
    },
    {status:400}
  );
}

if (
  body.priority &&
  !priorities.includes(body.priority)
) {
  return NextResponse.json(
    {
      success:false,
      message:"Invalid priority.",
    },
    {status:400}
  );
}

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

if (
  existingPartner.applicationStatus === "Rejected" &&
  body.applicationStatus === "Approved"
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Rejected partner cannot be approved directly.",
    },
    { status: 400 }
  );
}

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

    const partner = await Partner.findById(id);

if (!partner) {
  return NextResponse.json(
    {
      success: false,
      message: "Partner not found.",
    },
    { status: 404 }
  );
}

if (
  partner.applicationStatus === "Approved"
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Approved partners cannot be deleted.",
    },
    { status: 400 }
  );
}

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