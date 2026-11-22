import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { applyStaffBookingPayment } from "@/lib/applyStaffBookingPayment";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function supportedImage(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return true;
  }
  return buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP";
}
import {
  hubForbiddenResponse,
  staffCanAccessBooking,
} from "@/lib/staffHubScope";

export async function POST(req: Request) {
  let uploadedPublicId = "";
  let paymentRecorded = false;
  try {
    const session = await getAdminSession();
    if (!session) {
      return unauthorizedResponse();
    }
    const gate = await requireAdminDashboards(...API_DASHBOARDS.cashCollect);
    if (gate.error) return gate.error;

    const form = await req.formData();
    const bookingId = String(form.get("bookingId") || "").trim().toUpperCase();
    const amount = Number(form.get("amount"));
    const notes = String(form.get("notes") || "").trim();
    const photo = form.get("photo");
    if (!(photo instanceof File) || photo.size < 1) {
      return NextResponse.json(
        { success: false, message: "Capture a cash evidence photo before recording payment." },
        { status: 400 }
      );
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { success: false, message: "Cash evidence photo must be 5 MB or smaller." },
        { status: 413 }
      );
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Use a JPEG, PNG, or WebP camera photo." },
        { status: 400 }
      );
    }
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    if (!supportedImage(photoBuffer)) {
      return NextResponse.json(
        { success: false, message: "The selected file is not a supported image." },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = (await Booking.findOne({ bookingId })
      .select("currentHub startHub")
      .lean()) as { currentHub?: unknown; startHub?: unknown } | null;
    if (booking && !staffCanAccessBooking(session, booking)) {
      return hubForbiddenResponse();
    }

    const upload = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "kebuone/cash-evidence",
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
          use_filename: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cash evidence upload failed."));
            return;
          }
          resolve(result);
        }
      );
      stream.end(photoBuffer);
    });
    const cashHandoverPhotoUrl = String(upload.secure_url || "");
    uploadedPublicId = String(upload.public_id || "");
    if (!cashHandoverPhotoUrl || !uploadedPublicId) {
      throw new Error("Cash evidence upload returned no file reference.");
    }

    const result = await applyStaffBookingPayment({
      bookingId,
      paidAmount: amount,
      collectedBy: session.username,
      notes,
      cashHandoverPhotoUrl,
    });

    if (!result.ok) {
      await cloudinary.uploader.destroy(uploadedPublicId, { resource_type: "image" });
      uploadedPublicId = "";
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status }
      );
    }
    paymentRecorded = true;

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error) {
    if (uploadedPublicId && !paymentRecorded) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, { resource_type: "image" });
      } catch {
        /* Any orphan can be cleaned from the cash-evidence folder. */
      }
    }
    console.error("CASH COLLECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to record cash." },
      { status: 500 }
    );
  }
}
