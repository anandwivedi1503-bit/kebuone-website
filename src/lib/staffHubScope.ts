import type { AdminSessionInfo } from "@/lib/adminAuth";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import Booking from "@/models/Booking";

export function normalizeHubCodes(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : String(value || "")
        .split(/[,|\s]+/)
        .map((item) => item.trim());
  return Array.from(
    new Set(raw.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean))
  );
}

/** null = unrestricted (super admin, or staff with no hub list yet). */
export function sessionHubScope(session: AdminSessionInfo | null): string[] | null {
  if (!session || session.role === "super") return null;
  const hubs = normalizeHubCodes(session.hubs);
  return hubs.length ? hubs : null;
}

export function applyHubScope(
  filter: Record<string, unknown>,
  hubs: string[] | null,
  fields: string[]
) {
  if (!hubs?.length || fields.length === 0) return filter;
  const match =
    fields.length === 1
      ? { [fields[0]]: { $in: hubs } }
      : { $or: fields.map((field) => ({ [field]: { $in: hubs } })) };
  filter.$and = [...((filter.$and as unknown[]) || []), match];
  return filter;
}

export function bookingHubs(booking: {
  currentHub?: unknown;
  startHub?: unknown;
}): string[] {
  return normalizeHubCodes([booking.currentHub, booking.startHub]);
}

export function staffCanAccessBooking(
  session: AdminSessionInfo | null,
  booking: { currentHub?: unknown; startHub?: unknown }
) {
  const hubs = sessionHubScope(session);
  if (!hubs) return true;
  const codes = bookingHubs(booking);
  if (codes.length === 0) return true;
  return codes.some((code) => hubs.includes(code));
}

export function hubForbiddenResponse() {
  return Response.json(
    {
      success: false,
      message: "This booking is not at your assigned hub.",
    },
    { status: 403 }
  );
}

export async function scopedBookingIds(session: AdminSessionInfo | null) {
  const hubs = sessionHubScope(session);
  if (!hubs) return null;
  const ids = await Booking.distinct(
    "bookingId",
    applyHubScope({ ...NOT_DELETED_FILTER }, hubs, ["currentHub", "startHub"])
  );
  return ids.map((id) => String(id || "").trim()).filter(Boolean);
}

export async function scopedRiderIds(session: AdminSessionInfo | null) {
  const hubs = sessionHubScope(session);
  if (!hubs) return null;
  const ids = await Booking.distinct(
    "riderId",
    applyHubScope({ ...NOT_DELETED_FILTER }, hubs, ["currentHub", "startHub"])
  );
  return ids.map((id) => String(id || "").trim()).filter(Boolean);
}

export function idInScopeFilter(field: string, ids: string[] | null) {
  if (!ids) return {};
  return { [field]: { $in: ids.length ? ids : ["__none__"] } };
}
