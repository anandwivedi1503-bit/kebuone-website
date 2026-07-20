import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Hub from "@/models/Hub";
import Vehicle from "@/models/Vehicle";

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const body = await req.json();
    if (!body.hubName?.trim()) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Hub name is required."],
    },
    { status: 400 }
  );
}

if (!body.hubCode?.trim()) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Hub code is required."],
    },
    { status: 400 }
  );
}

if (Number(body.capacity) < 0) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Capacity cannot be negative."],
    },
    { status: 400 }
  );
}


const existingHub = await Hub.findOne({
  $or: [
    { hubName: body.hubName },
    { hubCode: body.hubCode },
  ],
});

if (existingHub) {
  return NextResponse.json(
    {
      success: false,
      errors: ["Hub already exists."],
    },
    { status: 409 }
  );
}

const hub = await Hub.create({
  hubName: String(body.hubName).trim(),
  hubCode: String(body.hubCode).trim().toUpperCase(),
  hubLocation: String(body.hubLocation).trim(),
  city: String(body.city || "").trim(),

  latitude: Number(body.latitude || 0),
  longitude: Number(body.longitude || 0),

  geofenceRadius: Number(body.geofenceRadius || 20),

  capacity: Number(body.capacity || 0),

  availableBikes: 0,

  readyBatteries: Number(body.readyBatteries || 0),

  status: body.status || "Active",
});

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

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
  return unauthorizedResponse();
}
    await connectDB();

    const hubs = await Hub.find().lean();

const vehicles = await Vehicle.find({
    vehicleStatus: "Available",
}).lean();

const updated = hubs.map((hub) => {

    const count = vehicles.filter(vehicle => {

        const hubName = String(hub.hubName).toLowerCase();
        const hubCode = String(hub.hubCode).toLowerCase();
        const currentHub = String(vehicle.currentHub).toLowerCase();

        return (
            currentHub === hubName ||
            currentHub === hubCode
        );

    }).length;

    return {
        ...hub,
        availableBikes: count,
    };

});

    return NextResponse.json({
      success: true,
      data: updated,
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