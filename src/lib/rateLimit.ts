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
    const existing = await RateBucket.findById(key).lean() as
      | { count?: number; resetAt?: Date }
      | null;
    if (!existing || new Date(existing.resetAt || 0).getTime() <= now.getTime()) {
      await RateBucket.findByIdAndUpdate(
        key,
        { $set: { count: 1, resetAt } },
        { upsert: true }
      );
      return true;
    }
    if (Number(existing.count || 0) >= limit) return false;
    await RateBucket.updateOne({ _id: key }, { $inc: { count: 1 } });
    return true;
  } catch {
    return memoryAllowed(key, limit, windowMs);
  }
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return (
    forwarded.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
