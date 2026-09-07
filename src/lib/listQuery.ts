import mongoose from "mongoose";

export const DEFAULT_LIST_LIMIT = 300;
export const MAX_LIST_LIMIT = 500;

export function parseListQuery(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const requested = Number.parseInt(searchParams.get("limit") || String(DEFAULT_LIST_LIMIT), 10);
  const limit = Math.min(MAX_LIST_LIMIT, Math.max(1, requested || DEFAULT_LIST_LIMIT));
  const q = String(searchParams.get("q") || "").trim();
  const rideStatus = String(searchParams.get("rideStatus") || "").trim();
  const paymentStatus = String(searchParams.get("paymentStatus") || "").trim();
  const hub = String(searchParams.get("hub") || "").trim();
  const city = String(searchParams.get("city") || "").trim();
  const riderId = String(searchParams.get("riderId") || "").trim();
  const vehicleId = String(searchParams.get("vehicleId") || "").trim();
  const rentalMode = String(searchParams.get("rentalMode") || "").trim();
  const from = String(searchParams.get("from") || "").trim();
  const to = String(searchParams.get("to") || "").trim();

  const cursor = String(searchParams.get("cursor") || "").trim();

  return {
    page,
    limit,
    skip: cursor ? 0 : (page - 1) * limit,
    cursor,
    q,
    rideStatus,
    paymentStatus,
    hub,
    city,
    riderId,
    vehicleId,
    rentalMode,
    from,
    to,
  };
}

export function applyOpsListFilters(
  filter: Record<string, unknown>,
  query: ReturnType<typeof parseListQuery>,
  fields: {
    hub?: string | string[];
    city?: string;
  } = {}
) {
  if (query.riderId) filter.riderId = query.riderId.toUpperCase();
  if (query.vehicleId) filter.vehicleId = query.vehicleId.toUpperCase();

  const hubFields = fields.hub
    ? Array.isArray(fields.hub)
      ? fields.hub
      : [fields.hub]
    : [];
  if (query.hub && hubFields.length === 1) {
    filter[hubFields[0]] = query.hub.toUpperCase();
  } else if (query.hub && hubFields.length > 1) {
    const hub = query.hub.toUpperCase();
    const hubMatch = { $or: hubFields.map((field) => ({ [field]: hub })) };
    filter.$and = [
      ...((filter.$and as unknown[]) || []),
      hubMatch,
    ];
  }

  if (query.city && fields.city) {
    const escaped = query.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter[fields.city] = new RegExp(escaped, "i");
  }

  const range = dateRangeFilter(query.from, query.to);
  if (range) Object.assign(filter, range);
}

export function appendBoundedText(existing: unknown, extra: string, max = 500) {
  return `${String(existing || "").trim()}\n${extra}`.trim().slice(0, max);
}

export function dateRangeFilter(from: string, to: string) {
  if (!from && !to) return null;
  const createdAt: Record<string, Date> = {};
  if (from) {
    const start = new Date(from);
    if (!Number.isNaN(start.getTime())) createdAt.$gte = start;
  }
  if (to) {
    const end = new Date(to);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      createdAt.$lte = end;
    }
  }
  return Object.keys(createdAt).length ? { createdAt } : null;
}

export function redactBookingOtps<T extends Record<string, unknown>>(booking: T) {
  const pickupOTP = String(booking.pickupOTP || "").trim();
  const rideStartOTP = String(booking.rideStartOTP || "").trim();
  const rideEndOTP = String(booking.rideEndOTP || "").trim();
  const rest = { ...booking };
  delete rest.pickupOTP;
  delete rest.rideStartOTP;
  delete rest.rideEndOTP;
  return {
    ...rest,
    pickupOTPGenerated: pickupOTP.length > 0,
    rideStartOTPGenerated: rideStartOTP.length > 0,
    rideEndOTPGenerated: rideEndOTP.length > 0,
  };
}

export function listResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    success: true as const,
    data,
    pagination: {
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  };
}

/** Skip a collection count: fetch one extra row to know if Load more exists. */
export function listResponseFromPage<T>(rows: T[], page: number, limit: number) {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const skip = (page - 1) * limit;
  return listResponse(
    data,
    skip + data.length + (hasMore ? 1 : 0),
    page,
    limit
  );
}

export function encodeCreatedCursor(createdAt: unknown, id: unknown) {
  const stamp = new Date(String(createdAt || "")).toISOString();
  const key = String(id || "").trim();
  if (!key || Number.isNaN(Date.parse(stamp))) return "";
  return Buffer.from(JSON.stringify({ t: stamp, id: key }), "utf8").toString(
    "base64url"
  );
}

export function decodeCreatedCursor(raw: string) {
  try {
    const parsed = JSON.parse(
      Buffer.from(String(raw || ""), "base64url").toString("utf8")
    ) as { t?: string; id?: string };
    const createdAt = new Date(String(parsed.t || ""));
    const id = String(parsed.id || "").trim();
    if (!id || Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

export function applyCreatedCursor(
  filter: Record<string, unknown>,
  rawCursor: string
) {
  const cursor = decodeCreatedCursor(rawCursor);
  if (!cursor) return;
  const id = mongoose.Types.ObjectId.isValid(cursor.id)
    ? new mongoose.Types.ObjectId(cursor.id)
    : cursor.id;
  const clause = {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: id } },
    ],
  };
  filter.$and = [...((filter.$and as unknown[]) || []), clause];
}

export function withNextCursor(
  payload: ReturnType<typeof listResponse>,
  last?: { createdAt?: unknown; _id?: unknown }
) {
  if (payload.pagination.hasMore && last) {
    const nextCursor = encodeCreatedCursor(last.createdAt, last._id);
    if (nextCursor) {
      return {
        ...payload,
        pagination: { ...payload.pagination, nextCursor },
      };
    }
  }
  return payload;
}
