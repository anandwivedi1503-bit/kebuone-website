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

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    q,
    rideStatus,
    paymentStatus,
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
