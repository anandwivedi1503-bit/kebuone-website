export const VEHICLE_ONLINE_WINDOW_MS = 15 * 60 * 1000;

export function hasRecentVehiclePing(
  lastPingTime: Date | string | null | undefined,
  nowMs = Date.now()
) {
  if (!lastPingTime) return false;
  const pingMs = lastPingTime instanceof Date
    ? lastPingTime.getTime()
    : new Date(lastPingTime).getTime();
  const ageMs = nowMs - pingMs;
  return Number.isFinite(pingMs) && ageMs >= -60_000 && ageMs <= VEHICLE_ONLINE_WINDOW_MS;
}

export function effectiveGpsStatus(
  status: unknown,
  lastPingTime: Date | string | null | undefined,
  nowMs = Date.now()
) {
  return String(status || "").trim().toUpperCase() === "ONLINE" &&
    hasRecentVehiclePing(lastPingTime, nowMs)
    ? "ONLINE"
    : "OFFLINE";
}
