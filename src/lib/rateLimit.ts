/** Shared limiter: Mongo when connected (multi-PM2), memory otherwise. */

import RateBucket from "@/models/RateBucket";

const hits = new Map<string, number[]>();

function memoryAllowed(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function isDuplicateKey(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      Number((error as { code?: number }).code) === 11000
  );
}

export async function rateLimitAllowed(
  key: string,
  limit: number,
  windowMs: number
) {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    await connectDB();
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    await RateBucket.updateOne(
      { _id: key, resetAt: { $lte: now } },
      { $set: { count: 0, resetAt } }
    );

    try {
      const updated = await RateBucket.findOneAndUpdate(
        { _id: key, count: { $lt: limit } },
        {
          $inc: { count: 1 },
          $setOnInsert: { resetAt },
        },
        { upsert: true, new: true }
      );
      return Boolean(updated);
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
      const raced = await RateBucket.findOneAndUpdate(
        { _id: key, count: { $lt: limit } },
        { $inc: { count: 1 } },
        { new: true }
      );
      return Boolean(raced);
    }
  } catch {
    return memoryAllowed(key, limit, windowMs);
  }
}

/** Prefer the TCP peer nginx sets; ignore spoofed X-Forwarded-For prefixes. */
export function clientIp(req: Request) {
  const real = String(req.headers.get("x-real-ip") || "").trim();
  if (real) return real;
  const forwarded = String(req.headers.get("x-forwarded-for") || "");
  const hops = forwarded
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  return hops.at(-1) || "unknown";
}
