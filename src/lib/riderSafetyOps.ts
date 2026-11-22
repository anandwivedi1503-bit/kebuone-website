import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import type { AdminSessionInfo } from "@/lib/adminAuth";
import Booking from "@/models/Booking";
import { rentalEndAtStart } from "@/lib/rentalSchedule";

export type RiderSafetyAlertLevel = "ok" | "warning" | "siren" | "overdue" | "unknown";

export type RiderSafetyRow = {
  bookingId: string;
  userName: string;
  userPhone: string;
  vehicleId: string;
  rentalMode: string;
  rideStatus: string;
  rentalEndDate: string;
  minutesUntilEnd: number;
  alertLevel: RiderSafetyAlertLevel;
  riderPhoneLat: number | null;
  riderPhoneLng: number | null;
  riderPhoneUpdatedAt: string | null;
  hasPhoneGps: boolean;
};

export function alertLevelForMinutes(minutes: number): RiderSafetyAlertLevel {
  if (minutes < 0) return "overdue";
  if (minutes <= 60) return "siren";
  if (minutes <= 180) return "warning";
  return "ok";
}

export function minutesUntil(isoOrDate: Date | string | undefined | null) {
  if (!isoOrDate) return 99999;
  const end = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(end.getTime())) return 99999;
  const diff = end.getTime() - Date.now();
  return diff >= 0
    ? Math.ceil(diff / 60000)
    : -Math.ceil(Math.abs(diff) / 60000);
}

export async function listRiderSafetyForAdmin(session: AdminSessionInfo) {
  await connectDB();
  const hubCodes = await resolveHubScope(session);
  const filter = applyHubScope(
    {
      ...NOT_DELETED_FILTER,
      rideStatus: "In Ride",
      rentalMode: { $ne: "Rent To Own" },
      $or: [
        { actualRideStart: { $type: "date" } },
        { rentalEndDate: { $type: "date" } },
      ],
    },
    hubCodes,
    ["currentHub", "startHub"]
  );

  const rows = await Booking.find(filter)
    .select(
      "bookingId userName userPhone vehicleId rentalMode rentalHours rentToOwnMonths rideStatus rentalEndDate actualRideStart riderPhoneLat riderPhoneLng riderPhoneUpdatedAt"
    )
    .sort({ rentalEndDate: 1 })
    .limit(50)
    .lean()
    .maxTimeMS(4000);

  const mapped: RiderSafetyRow[] = rows.map((row) => {
    const lat = Number(row.riderPhoneLat);
    const lng = Number(row.riderPhoneLng);
    const updatedAt = row.riderPhoneUpdatedAt
      ? new Date(row.riderPhoneUpdatedAt).getTime()
      : NaN;
    const gpsIsFresh =
      Number.isFinite(updatedAt) &&
      updatedAt <= Date.now() + 2 * 60_000 &&
      Date.now() - updatedAt <= 5 * 60_000;
    const hasPhoneGps =
      gpsIsFresh &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat !== 0 &&
      lng !== 0;
    const actualEnd = row.actualRideStart
      ? rentalEndAtStart(
          new Date(row.actualRideStart),
          String(row.rentalMode || ""),
          Number(row.rentalHours || 1),
          Number(row.rentToOwnMonths || 20)
        )
      : null;
    const end = actualEnd;
    const minutes = end ? minutesUntil(end) : 99999;
    return {
      bookingId: String(row.bookingId || ""),
      userName: String(row.userName || ""),
      userPhone: String(row.userPhone || ""),
      vehicleId: String(row.vehicleId || ""),
      rentalMode: String(row.rentalMode || ""),
      rideStatus: String(row.rideStatus || ""),
      rentalEndDate: end
        ? new Date(end).toISOString()
        : "",
      minutesUntilEnd: minutes,
      alertLevel: end ? alertLevelForMinutes(minutes) : "unknown",
      riderPhoneLat: hasPhoneGps ? lat : null,
      riderPhoneLng: hasPhoneGps ? lng : null,
      riderPhoneUpdatedAt: row.riderPhoneUpdatedAt
        ? new Date(row.riderPhoneUpdatedAt).toISOString()
        : null,
      hasPhoneGps,
    };
  });

  mapped.sort((a, b) => a.minutesUntilEnd - b.minutesUntilEnd);
  return mapped;
}
