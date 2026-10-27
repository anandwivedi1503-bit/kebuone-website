export const DEFAULT_LIVE_CITY = "Lucknow";

/** Cities with live EVUDDY hubs (public copy). API /api/cities is source of truth when loaded. */
export const FALLBACK_LIVE_CITIES = [DEFAULT_LIVE_CITY];

export function formatLiveCitiesList(cities: string[]) {
  const list = cities.filter(Boolean);
  if (list.length === 0) return DEFAULT_LIVE_CITY;
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}
