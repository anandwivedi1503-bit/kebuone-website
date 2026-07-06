import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const maxFileSize = 5 * 1024 * 1024;

function getBase64FileSize(base64Data: string) {
  const base64 = base64Data.split(",")[1] || "";
  return Math.floor((base64.length * 3) / 4);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firebaseIdToken = String(body.firebaseIdToken || "").trim();

    if (!firebaseIdToken) {
      return NextResponse.json(
        { success: false, error: "OTP verification is required before upload." },
        { status: 401 }
      );
    }

    await adminAuth.verifyIdToken(firebaseIdToken);

    if (!body.file || typeof body.file !== "string") {
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 }
      );
    }

    const file = body.file.trim();
    const match = file.match(/^data:(.+);base64,/);

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Invalid file format" },
        { status: 400 }
      );
    }

    const mimeType = match[1];

    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: "Only PDF, JPG, PNG, and WEBP files are allowed" },
        { status: 400 }
      );
    }

    if (getBase64FileSize(file) > maxFileSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5 MB" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: "kebuone/riders",
      resource_type: "auto",
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Upload failed. Please verify OTP again." },
      { status: 500 }
    );
  }
}