import mongoose from "mongoose";

import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { normalizeIndianPhone } from "@/lib/requestAuth";
import Rider from "@/models/Rider";

type BookingRiderFields = {
  riderId?: string;
  userId?: unknown;
  userPhone?: string;
};

type RiderIdentity = {
  _id?: unknown;
  riderId?: string;
  phone?: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function bookingRiderLookupClauses(booking: BookingRiderFields) {
  const clauses: Record<string, unknown>[] = [];
  const riderId = String(booking.riderId || "").trim();

  if (riderId) {
    clauses.push({ riderId });
    const upper = riderId.toUpperCase();
    if (upper !== riderId) {
      clauses.push({ riderId: upper });
    }
    clauses.push({
      riderId: { $regex: `^${escapeRegex(riderId)}$`, $options: "i" },
    });
    if (/^[a-fA-F0-9]{24}$/.test(riderId)) {
      clauses.push({ _id: riderId });
    }
  }

  const userId = booking.userId;
  if (userId && mongoose.Types.ObjectId.isValid(String(userId))) {
    clauses.push({ _id: userId });
  }

  const phone = normalizeIndianPhone(booking.userPhone);
  if (phone) {
    clauses.push({ phone });
  }

  return clauses;
}

export async function findBookingRider(
  booking: BookingRiderFields,
  session?: mongoose.ClientSession | null
) {
  const clauses = bookingRiderLookupClauses(booking);
  if (!clauses.length) {
    return null;
  }

  const query = Rider.findOne({
    $and: [NOT_DELETED_FILTER, { $or: clauses }],
  });

  if (session) {
    query.session(session);
  }

  return query;
}

export function bookingBelongsToRiderFilter(rider: RiderIdentity) {
  const or: Record<string, unknown>[] = [];
  const riderId = String(rider.riderId || "").trim();
  if (riderId) {
    or.push({ riderId });
    or.push({
      riderId: { $regex: `^${escapeRegex(riderId)}$`, $options: "i" },
    });
  }
  if (rider._id) {
    or.push({ userId: rider._id });
  }
  const phone = normalizeIndianPhone(rider.phone);
  if (phone) {
    or.push({ userPhone: phone });
  }
  return or.length ? { $or: or } : { riderId: "__none__" };
}

export function syncBookingRiderId(
  booking: { riderId?: string },
  rider: { riderId?: string }
) {
  const nextId = String(rider.riderId || "").trim();
  if (nextId && String(booking.riderId || "").trim() !== nextId) {
    booking.riderId = nextId;
  }
}
