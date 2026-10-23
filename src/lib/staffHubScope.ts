import type { AdminSessionInfo } from "@/lib/adminAuth";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import Booking from "@/models/Booking";
import Hub from "@/models/Hub";

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

/**
 * null = unrestricted (super admin, or staff with no hub list).
 * Team Access says an empty hub list means every yard — not a blank desk.
 */
export function sessionHubScope(session: AdminSessionInfo | null): string[] | null {
  if (!session || session.role === "super") return null;
  const hubs = normalizeHubCodes(session.hubs);
  return hubs.length ? hubs : null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Expand assigned hub codes to names/locations so yard logins match booking rows. */
export async function resolveHubScope(
  session: AdminSessionInfo | null
): Promise<string[] | null> {
  const hubs = sessionHubScope(session);
  if (hubs === null || hubs.length === 0) return hubs;

  try {
    const rx = new RegExp(`^(${hubs.map(escapeRegex).join("|")})$`, "i");
    const rows = (await Hub.find({
      $and: [
        NOT_DELETED_FILTER,
        {
          $or: [
            { hubCode: { $in: hubs } },
            { hubName: rx },
            { hubLocation: rx },
          ],
        },
      ],
    })
      .select("hubCode hubName hubLocation")
      .lean()) as Array<{
      hubCode?: string;
      hubName?: string;
      hubLocation?: string;
    }>;

    const aliases = new Set(hubs);
    for (const row of rows) {
      for (const value of [row.hubCode, row.hubName, row.hubLocation]) {
        const trimmed = String(value || "").trim();
        if (trimmed) aliases.add(trimmed);
        const upper = trimmed.toUpperCase();
        if (upper) aliases.add(upper);
      }
    }
    return Array.from(aliases);
  } catch {
    return hubs;
  }
}

export function applyHubScope(
  filter: Record<string, unknown>,
  hubs: string[] | null,
  fields: string[]
) {
  if (hubs === null || fields.length === 0) return filter;
  if (hubs.length === 0) {
    filter.$and = [...((filter.$and as unknown[]) || []), { _id: { $in: [] } }];
    return filter;
  }
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
  booking: { currentHub?: unknown; startHub?: unknown },
  hubsOverride?: string[] | null
) {
  const hubs = hubsOverride === undefined ? sessionHubScope(session) : hubsOverride;
  if (hubs === null) return true;
  if (!hubs.length) return false;
  const allowed = new Set(hubs.map((item) => item.toUpperCase()));
  const codes = bookingHubs(booking);
  if (codes.length === 0) return false;
  return codes.some((code) => allowed.has(code) || hubs.includes(code));
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

export async function riderInSessionScope(
  session: AdminSessionInfo | null,
  riderId?: string
) {
  const hubs = await resolveHubScope(session);
  if (hubs === null) return true;
  if (!hubs.length) return false;
  const id = String(riderId || "").trim().toUpperCase();
  if (!id) return false;
  const atAssignedHub = await Booking.exists(
    applyHubScope(
      { ...NOT_DELETED_FILTER, riderId: id },
      hubs,
      ["currentHub", "startHub"]
    )
  );
  if (atAssignedHub) return true;
  const bookedElsewhere = await Booking.exists({
    ...NOT_DELETED_FILTER,
    riderId: id,
  });
  return !bookedElsewhere;
}

export async function denyIfRiderOutOfHub(
  session: AdminSessionInfo | null,
  riderId?: string
) {
  if (await riderInSessionScope(session, riderId)) return null;
  return Response.json(
    {
      success: false,
      message: "This rider is not at your assigned hub.",
    },
    { status: 403 }
  );
}

export async function denyIfBookingOutOfHub(
  session: AdminSessionInfo | null,
  bookingId?: string
) {
  const hubs = await resolveHubScope(session);
  if (hubs === null) return null;
  if (!hubs.length) return hubForbiddenResponse();
  const id = String(bookingId || "").trim();
  if (!id) return null;
  const booking = (await Booking.findOne({ bookingId: id })
    .select("currentHub startHub")
    .lean()) as { currentHub?: unknown; startHub?: unknown } | null;
  if (!booking) return null;
  if (staffCanAccessBooking(session, booking, hubs)) return null;
  return hubForbiddenResponse();
}

export async function scopedBookingIds(session: AdminSessionInfo | null) {
  const hubs = await resolveHubScope(session);
  if (hubs === null) return null;
  if (!hubs.length) return [];
  const ids = await Booking.distinct(
    "bookingId",
    applyHubScope({ ...NOT_DELETED_FILTER }, hubs, ["currentHub", "startHub"])
  );
  return ids.map((id) => String(id || "").trim()).filter(Boolean);
}

export async function scopedRiderIds(session: AdminSessionInfo | null) {
  const hubs = await resolveHubScope(session);
  if (hubs === null) return null;
  if (!hubs.length) return [];
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

/** Hub staff still see website/contact tickets that have no booking. */
export function idInScopeOrWebsiteFilter(field: string, ids: string[] | null) {
  if (!ids) return {};
  return {
    $or: [
      { [field]: { $in: ids.length ? ids : ["__none__"] } },
      { [field]: { $in: ["", null] } },
      { ticketSource: "Website" },
    ],
  };
}

export function mergeFilters(...parts: Array<Record<string, unknown> | undefined | null>) {
  const nonempty = parts.filter((part): part is Record<string, unknown> =>
    Boolean(part && Object.keys(part).length)
  );
  if (!nonempty.length) return {};
  if (nonempty.length === 1) return nonempty[0];
  return { $and: nonempty };
}
