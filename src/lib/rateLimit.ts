const hits = new Map<string, number[]>();

export function rateLimitAllowed(
  key: string,
  limit: number,
  windowMs: number
) {
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

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return (
    forwarded.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
