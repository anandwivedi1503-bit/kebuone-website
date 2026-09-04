import { NOT_DELETED_FILTER } from "@/lib/notDeleted";

function decodeLookupId(id: string) {
  const trimmed = String(id || "").trim();
  try {
    return decodeURIComponent(trimmed).trim();
  } catch {
    return trimmed;
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match riders by public riderId, Mongo _id, or phone. Ignores missing isDeleted. */
export function riderLookupFilter(id: string): Record<string, unknown> {
  const cleanedId = decodeLookupId(id);
  const upperId = cleanedId.toUpperCase();
  const identity: Array<Record<string, unknown>> = [];

  if (cleanedId) {
    identity.push({ riderId: cleanedId }, { riderId: upperId });
    identity.push({
      riderId: { $regex: `^${escapeRegex(cleanedId)}$`, $options: "i" },
    });
  }

  if (/^[a-fA-F0-9]{24}$/.test(cleanedId)) {
    identity.push({ _id: cleanedId });
  }

  const phone = cleanedId.replace(/\D/g, "").slice(-10);
  if (/^[6-9]\d{9}$/.test(phone)) {
    identity.push(
      { phone },
      { phone: `+91${phone}` },
      { phone: `91${phone}` }
    );
  }

  return {
    $and: [
      NOT_DELETED_FILTER,
      { $or: identity.length > 0 ? identity : [{ riderId: cleanedId }] },
    ],
  };
}
