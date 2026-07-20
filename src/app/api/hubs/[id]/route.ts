import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Hub from "@/models/Hub";
import Vehicle from "@/models/Vehicle";
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
    if (
  body.capacity !== undefined &&
  Number(body.capacity) < 0
) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid capacity.",
    },
    { status: 400 }
  );
}

if (
  body.readyBatteries !== undefined &&
  Number(body.readyBatteries) < 0
) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid battery count.",
    },
    { status: 400 }
  );
}
    delete body.hubCode;
    delete body.availableBikes;

    const hub = await Hub.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
      }
    );

    return NextResponse.json({
      success: true,
      data: hub,
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
    await connectDB();

    const { id } = await params;

    const hub = await Hub.findById(id);

if (!hub) {
  return NextResponse.json(
    {
      success: false,
      message: "Hub not found.",
    },
    { status: 404 }
  );
}

const vehicles = await Vehicle.countDocuments({
  $or: [
    { currentHub: hub.hubName },
    { currentHub: hub.hubCode },
  ],
});

if (vehicles > 0) {
  return NextResponse.json(
    {
      success: false,
      message: "Move all vehicles from this hub before deleting it.",
    },
    { status: 400 }
  );
}

await Hub.findByIdAndDelete(id);

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