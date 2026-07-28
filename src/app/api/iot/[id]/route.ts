import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import IoT from "@/models/IoT";

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
    const errors: string[] = [];

if (
body.batteryPercentage !== undefined &&
(
Number(body.batteryPercentage) < 0 ||
Number(body.batteryPercentage) > 100
)
){
errors.push("Battery percentage must be between 0 and 100.");
}

if (
body.currentLat !== undefined &&
(
Number(body.currentLat) < -90 ||
Number(body.currentLat) > 90
)
){
errors.push("Latitude is invalid.");
}

if (
body.currentLng !== undefined &&
(
Number(body.currentLng) < -180 ||
Number(body.currentLng) > 180
)
){
errors.push("Longitude is invalid.");
}

if (
body.lockStatus &&
!["Locked","Unlocked"].includes(body.lockStatus)
){
errors.push("Invalid Lock Status.");
}

if (
body.gpsStatus &&
!["ONLINE","OFFLINE"].includes(
String(body.gpsStatus).toUpperCase()
)
){
errors.push("Invalid GPS Status.");
}

if (
body.vehicleStatus &&
!(
[
"Available",
"Booked",
"Ready For Pickup",
"In Ride",
"Maintenance",
"Low Battery",
]
.includes(body.vehicleStatus)
)
){
errors.push("Invalid Vehicle Status.");
}

if(errors.length){

return NextResponse.json(
{
success:false,
errors,
},
{status:400}
);

}

    const iot = await IoT.findByIdAndUpdate(
      id,
      body,
      { new: true, 
        runValidators:true,
       }
    );

    return NextResponse.json({
      success: true,
      data: iot,
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

    await IoT.findByIdAndDelete(id);

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