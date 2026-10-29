import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import { riderLookupFilter } from "@/lib/riderLookup";
import Rider from "@/models/Rider";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const firebaseUser = await getVerifiedFirebaseUser(req);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, message: "Sign in with OTP on this phone first." },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const riderId = clean(body.riderId);
    const fullName = clean(body.fullName).slice(0, 80);
    const email = clean(body.email).slice(0, 120);
    const profilePhotoUrl = clean(body.profilePhotoUrl).slice(0, 500);
    const instagramId = clean(body.instagramId).slice(0, 80);
    const facebookId = clean(body.facebookId).slice(0, 120);

    if (!riderId) {
      return NextResponse.json(
        { success: false, message: "Rider id is required." },
        { status: 400 }
      );
    }
    if (fullName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Enter your full name." },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email." },
        { status: 400 }
      );
    }

    const rider = await Rider.findOne(riderLookupFilter(riderId));
    if (!rider || rider.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Rider not found." },
        { status: 404 }
      );
    }

    if (!firebaseUserOwnsRider(firebaseUser, rider as any)) {
      return NextResponse.json(
        { success: false, message: "This profile belongs to another mobile." },
        { status: 403 }
      );
    }

    rider.fullName = fullName;
    rider.email = email;
    if (profilePhotoUrl.startsWith("http")) {
      rider.profilePhotoUrl = profilePhotoUrl;
    }
    if (instagramId) rider.instagramId = instagramId;
    if (facebookId) rider.facebookId = facebookId;
    rider.updatedBy = "RiderApp";
    await rider.save({ validateModifiedOnly: true });

    return NextResponse.json({
      success: true,
      message: "Profile updated.",
      data: {
        riderId: rider.riderId,
        fullName: rider.fullName,
        email: rider.email,
        profilePhotoUrl: rider.profilePhotoUrl,
        instagramId: rider.instagramId,
        facebookId: rider.facebookId,
      },
    });
  } catch (error) {
    console.error("RIDER PROFILE UPDATE:", error);
    return NextResponse.json(
      { success: false, message: "Could not update profile." },
      { status: 500 }
    );
  }
}
