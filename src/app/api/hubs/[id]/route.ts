import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Hub from "@/models/Hub";
import Vehicle from "@/models/Vehicle";
import Battery from "@/models/Battery";
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

if (
  body.capacity !== undefined &&
  body.readyBatteries !== undefined &&
  Number(body.readyBatteries) > Number(body.capacity)
) {
  return NextResponse.json(
    {
      success: false,
      message: "Ready batteries cannot exceed hub capacity.",
    },
    { status: 400 }
  );
}
    delete body.hubCode;
    delete body.availableBikes;

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

Object.assign(hub, body);

if (hub.readyBatteries > hub.capacity) {
  return NextResponse.json(
    {
      success: false,
      message: "Ready batteries cannot exceed capacity.",
    },
    { status: 400 }
  );
}

if (hub.availableBikes > hub.capacity) {
  return NextResponse.json(
    {
      success: false,
      message: "Available bikes cannot exceed capacity.",
    },
    { status: 400 }
  );
}

if (
  hub.availableBikes === 0 &&
  hub.readyBatteries === 0
) {
  hub.status = "Maintenance";
}

await hub.save();

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

const batteries = await Battery.countDocuments({
  $or: [
    { hubName: hub.hubName },
    { hubId: hub.hubCode },
  ],
});

if (batteries > 0) {
  return NextResponse.json(
    {
      success: false,
      message: "Move all batteries from this hub before deleting it.",
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