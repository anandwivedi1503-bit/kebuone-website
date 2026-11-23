import cloudinary from "@/lib/cloudinary";

export const MAX_CASH_EVIDENCE_BYTES = 5 * 1024 * 1024;
export const CASH_EVIDENCE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function cashEvidenceBufferIsValid(buffer: Buffer) {
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

export async function uploadCashEvidence(buffer: Buffer) {
  return new Promise<{ publicId: string; version: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "kebuone/cash-evidence",
        resource_type: "image",
        type: "authenticated",
        overwrite: false,
        unique_filename: true,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result?.public_id) {
          reject(error || new Error("Cash evidence upload returned no file reference."));
          return;
        }
        resolve({ publicId: result.public_id, version: Number(result.version || 0) });
      }
    );
    stream.end(buffer);
  });
}

export function signedCashEvidenceUrl(publicId: string, version?: number) {
  return cloudinary.url(publicId, {
    resource_type: "image",
    type: "authenticated",
    secure: true,
    sign_url: true,
    ...(version ? { version } : {}),
  });
}
