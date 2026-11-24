import { NextResponse } from "next/server";

import { getAdminSession, unauthorizedResponse } from "@/lib/adminAuth";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import cloudinary from "@/lib/cloudinary";
import { writeAudit } from "@/lib/writeAudit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;

function isAllowedImage(buffer: Buffer) {
  return (
    (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP")
  );
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorizedResponse();
  if (session.role !== "super") {
    return NextResponse.json(
      { success: false, message: "Only the super admin can upload campaign posters." },
      { status: 403 }
    );
  }
  if (!(await rateLimitAllowed(`brand-campaign-upload:${session.username}:${clientIp(request)}`, 10, 60 * 60 * 1000))) {
    return NextResponse.json(
      { success: false, message: "Upload limit reached. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size < 1) {
      return NextResponse.json({ success: false, message: "Choose an image to upload." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "Poster images must be 5 MB or smaller." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isAllowedImage(buffer)) {
      return NextResponse.json({ success: false, message: "Use a JPG, PNG, or WebP image." }, { status: 400 });
    }

    const uploaded = await new Promise<{ public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "kebuone/brand-campaigns",
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
          use_filename: false,
        },
        (error, result) => {
          if (error || !result?.public_id) {
            reject(error || new Error("Campaign poster upload returned no file reference."));
            return;
          }
          resolve({ public_id: result.public_id });
        }
      );
      stream.end(buffer);
    });

    const url = cloudinary.url(uploaded.public_id, {
      secure: true,
      resource_type: "image",
      transformation: [
        { width: 1600, height: 1200, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    await writeAudit({
      actor: session.username,
      action: "BRAND_CAMPAIGN_POSTER_UPLOADED",
      entity: "BrandCampaign",
      detail: `Uploaded poster asset ${uploaded.public_id}`,
    });

    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (cause) {
    console.error("BRAND CAMPAIGN POSTER UPLOAD:", cause);
    return NextResponse.json(
      { success: false, message: "Poster upload failed. Try again with a JPG, PNG, or WebP image." },
      { status: 500 }
    );
  }
}
