import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const file = body.file;
    const firebaseIdToken = body.firebaseIdToken;

    if (!firebaseIdToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone verification required.",
        },
        { status: 401 }
      );
    }

    await adminAuth.verifyIdToken(firebaseIdToken);

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file received.",
        },
        { status: 400 }
      );
    }

    if (
      typeof file !== "string" ||
      !file.startsWith("data:")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format.",
        },
        { status: 400 }
      );
    }

    const matches = file.match(/^data:(.*?);base64,(.*)$/);

    if (!matches) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Base64 data.",
        },
        { status: 400 }
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type.",
        },
        { status: 400 }
      );
    }

    const fileSize = Buffer.from(base64Data, "base64").length;

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5 MB.",
        },
        { status: 400 }
      );
    }

    const folder =
      mimeType === "application/pdf"
        ? "kebuone/kyc/documents"
        : "kebuone/kyc/images";

    const upload = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      url: upload.secure_url,
      publicId: upload.public_id,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Upload failed.",
      },
      { status: 500 }
    );
  }
}