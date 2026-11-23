import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import cloudinary from "@/lib/cloudinary";
import {
  CASH_EVIDENCE_TYPES,
  cashEvidenceBufferIsValid,
  MAX_CASH_EVIDENCE_BYTES,
  signedCashEvidenceUrl,
  uploadCashEvidence,
} from "@/lib/cashEvidence";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { writeAudit } from "@/lib/writeAudit";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { hubForbiddenResponse, staffCanAccessBooking } from "@/lib/staffHubScope";

export const runtime = "nodejs";
export const maxDuration = 60;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function loadCashEvidence(query: URLSearchParams) {
  const transactionId = String(query.get("transactionId") || "").trim();
  const bookingId = String(query.get("bookingId") || "").trim().toUpperCase();
  if (!transactionId && !bookingId) return null;

  type EvidenceRecord = Record<string, any> & {
    currentHub?: unknown;
    startHub?: unknown;
  };
  let transaction: EvidenceRecord | null = null;
  if (transactionId) {
    transaction = (await Transaction.findOne({
      transactionId,
      paymentMethod: "Cash",
      ...NOT_DELETED_FILTER,
    })
      .select("bookingId cashHandoverPhotoPublicId cashHandoverPhotoVersion cashHandoverPhotoUrl")
      .lean()) as EvidenceRecord | null;
    if (!transaction) return null;
  }

  const resolvedBookingId = String(transaction?.bookingId || bookingId).trim().toUpperCase();
  const booking = (await Booking.findOne({
    bookingId: resolvedBookingId,
    ...NOT_DELETED_FILTER,
  })
    .select("bookingId currentHub startHub cashHandoverPhotoPublicId cashHandoverPhotoVersion cashHandoverPhotoUrl")
    .lean()) as EvidenceRecord | null;
  if (!booking) return null;

  if (!transaction && !bookingId) return null;
  return { transaction, booking };
}

async function proxyImage(url: string) {
  const image = await fetch(url, { cache: "no-store", redirect: "error" });
  if (!image.ok || !image.body) {
    return errorResponse("Cash photo is unavailable. Refresh the dashboard and try again.", 502);
  }
  const contentType = String(image.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!CASH_EVIDENCE_TYPES.includes(contentType as (typeof CASH_EVIDENCE_TYPES)[number])) {
    return errorResponse("Cash photo has an unsupported format.", 502);
  }
  const length = Number(image.headers.get("content-length") || 0);
  if (length > MAX_CASH_EVIDENCE_BYTES) {
    return errorResponse("Cash photo exceeds the allowed size.", 502);
  }

  return new Response(image.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(
      ...API_DASHBOARDS.cashCollect,
      ...API_DASHBOARDS.cashHandover
    );
    if (gate.error || !gate.session) return gate.error || unauthorizedResponse();
    await connectDB();

    const query = new URL(req.url).searchParams;
    const loaded = await loadCashEvidence(query);
    if (!loaded) return errorResponse("Cash photo not found.", 404);

    if (!staffCanAccessBooking(gate.session, loaded.booking)) {
      return hubForbiddenResponse();
    }

    const publicId = String(
      loaded.transaction?.cashHandoverPhotoPublicId ||
      loaded.booking.cashHandoverPhotoPublicId ||
      ""
    ).trim();
    const version = Number(
      loaded.transaction?.cashHandoverPhotoVersion ||
      loaded.booking.cashHandoverPhotoVersion ||
      0
    );

    if (publicId) {
      return await proxyImage(signedCashEvidenceUrl(publicId, version));
    }

    // Older evidence is still stored as a Cloudinary URL. Proxy it through the
    // same role and hub checks so the dashboard does not expose that URL.
    const legacyUrl = String(
      loaded.transaction?.cashHandoverPhotoUrl || loaded.booking.cashHandoverPhotoUrl || ""
    ).trim();
    if (!legacyUrl) return errorResponse("Cash photo not found.", 404);
    const parsed = new URL(legacyUrl);
    const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !cloudName ||
      !parsed.pathname.startsWith(`/${cloudName}/`)
    ) {
      return errorResponse("Cash photo is not stored in the approved image service.", 502);
    }
    return await proxyImage(parsed.toString());
  } catch (error) {
    console.error("CASH EVIDENCE VIEW ERROR:", error);
    return errorResponse("Unable to load cash photo.", 500);
  }
}

export async function POST(req: Request) {
  let uploadedPublicId = "";
  try {
    const gate = await requireAdminDashboards(
      ...API_DASHBOARDS.cashCollect,
      ...API_DASHBOARDS.cashHandover
    );
    if (gate.error || !gate.session) return gate.error || unauthorizedResponse();

    const form = await req.formData();
    const bookingId = String(form.get("bookingId") || "").trim().toUpperCase();
    const photo = form.get("photo");
    if (!bookingId) return errorResponse("Booking ID is required.", 400);
    if (!(photo instanceof File) || photo.size < 1) {
      return errorResponse("Capture a cash handover photo first.", 400);
    }
    if (photo.size > MAX_CASH_EVIDENCE_BYTES) {
      return errorResponse("Cash photo must be 5 MB or smaller.", 413);
    }
    if (!(CASH_EVIDENCE_TYPES as readonly string[]).includes(photo.type.toLowerCase())) {
      return errorResponse("Use a JPEG, PNG, or WebP photo.", 400);
    }

    const buffer = Buffer.from(await photo.arrayBuffer());
    if (!cashEvidenceBufferIsValid(buffer)) {
      return errorResponse("The selected file is not a supported image.", 400);
    }

    await connectDB();
    const booking = await Booking.findOne({ bookingId, ...NOT_DELETED_FILTER });
    if (!booking) return errorResponse("Booking not found.", 404);
    if (!staffCanAccessBooking(gate.session, booking)) return hubForbiddenResponse();

    const upload = await uploadCashEvidence(buffer);
    uploadedPublicId = upload.publicId;
    booking.cashHandoverPhotoPublicId = upload.publicId;
    booking.cashHandoverPhotoVersion = upload.version;
    booking.cashHandoverPhotoUrl = "";
    await booking.save();
    uploadedPublicId = "";

    void writeAudit({
      actor: gate.session.username,
      action: "CASH_EVIDENCE_UPLOADED",
      entity: "Booking",
      entityId: bookingId,
      bookingId,
      detail: "Private cash handover photo attached to booking.",
    });

    return NextResponse.json({
      success: true,
      data: { bookingId, photoAvailable: true },
      message: "Cash photo saved securely to the booking.",
    });
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "image",
          type: "authenticated",
        });
      } catch {
        /* A failed cleanup is kept out of the rider-facing response. */
      }
    }
    console.error("CASH EVIDENCE UPLOAD ERROR:", error);
    return errorResponse("Unable to save cash photo. Check the connection and try again.", 500);
  }
}
