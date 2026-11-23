import { NextResponse } from "next/server";

import { getAdminSession, requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { applyStaffBookingPayment } from "@/lib/applyStaffBookingPayment";
import cloudinary from "@/lib/cloudinary";
import {
  CASH_EVIDENCE_TYPES,
  cashEvidenceBufferIsValid,
  MAX_CASH_EVIDENCE_BYTES,
  uploadCashEvidence,
} from "@/lib/cashEvidence";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    if (photo.size > MAX_CASH_EVIDENCE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Cash evidence photo must be 5 MB or smaller." },
        { status: 413 }
      );
    }
    if (!(CASH_EVIDENCE_TYPES as readonly string[]).includes(photo.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Use a JPEG, PNG, or WebP camera photo." },
        { status: 400 }
      );
    }
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    if (!cashEvidenceBufferIsValid(photoBuffer)) {
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

    const upload = await uploadCashEvidence(photoBuffer);
    uploadedPublicId = upload.publicId;

    const result = await applyStaffBookingPayment({
      bookingId,
      paidAmount: amount,
      collectedBy: session.username,
      notes,
      cashHandoverPhotoPublicId: upload.publicId,
      cashHandoverPhotoVersion: upload.version,
    });

    if (!result.ok) {
      await cloudinary.uploader.destroy(uploadedPublicId, {
        resource_type: "image",
        type: "authenticated",
      });
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
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "image",
          type: "authenticated",
        });
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
