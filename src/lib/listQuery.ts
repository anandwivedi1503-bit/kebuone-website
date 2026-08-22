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

  return {
    page,
    limit,
    skip: (page - 1) * limit,
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
