import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import { adminAuth } from "@/lib/firebaseAdmin";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAX_BASE64_LENGTH =
  Math.ceil((MAX_FILE_SIZE * 4) / 3) + 1000;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function normalizeMimeType(value: string): string {
  const mimeType = value.toLowerCase();

  if (mimeType === "image/jpg") {
    return "image/jpeg";
  }

  return mimeType;
}

function detectFileType(
  buffer: Buffer
): string | null {
  if (
    buffer.length >= 4 &&
    buffer.subarray(0, 4).toString() === "%PDF"
  ) {
    return "application/pdf";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(
        Buffer.from([
          0x89,
          0x50,
          0x4e,
          0x47,
          0x0d,
          0x0a,
          0x1a,
          0x0a,
        ])
      )
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    if (!rateLimitAllowed(`upload:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

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

    /*
     * Verify Firebase token server-side.
     */
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

    const matches = file.match(
      /^data:([^;]+);base64,(.+)$/
    );

    if (!matches) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Base64 data.",
        },
        { status: 400 }
      );
    }

    const mimeType = normalizeMimeType(matches[1]);
    const base64Data = matches[2];

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type.",
        },
        { status: 400 }
      );
    }

    /*
     * Prevent oversized Base64 payloads before decoding.
     */
    if (base64Data.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5 MB.",
        },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(
      base64Data,
      "base64"
    );

    if (buffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty file.",
        },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 5 MB.",
        },
        { status: 413 }
      );
    }

    /*
     * Verify actual file signature instead of trusting
     * the MIME type supplied by the client.
     */
    const detectedMimeType =
      detectFileType(buffer);

    if (
      !detectedMimeType ||
      detectedMimeType !== mimeType
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "File content does not match the declared file type.",
        },
        { status: 400 }
      );
    }

    const folder =
      mimeType === "application/pdf"
        ? "kebuone/kyc/documents"
        : "kebuone/kyc/images";

    const upload =
      await cloudinary.uploader.upload(file, {
        folder,
        resource_type:
          mimeType === "application/pdf"
            ? "raw"
            : "image",
        overwrite: false,
        unique_filename: true,
        use_filename: false,
      });

    return NextResponse.json(
      {
        success: true,
        url: upload.secure_url,
        publicId: upload.public_id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "========== CLOUDINARY UPLOAD ERROR =========="
    );
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to upload file.",
      },
      { status: 500 }
    );
  }
}