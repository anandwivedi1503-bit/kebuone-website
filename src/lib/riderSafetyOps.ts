import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { applyHubScope, resolveHubScope } from "@/lib/staffHubScope";
import type { AdminSessionInfo } from "@/lib/adminAuth";
import Booking from "@/models/Booking";

export type RiderSafetyAlertLevel = "ok" | "warning" | "siren";

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
  if (minutes <= 60) return "siren";
  if (minutes <= 180) return "warning";
  return "ok";
}

export function minutesUntil(isoOrDate: Date | string | undefined | null) {
  if (!isoOrDate) return 99999;
  const end = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(end.getTime())) return 99999;
  return Math.max(0, Math.round((end.getTime() - Date.now()) / 60000));
}

export async function listRiderSafetyForAdmin(session: AdminSessionInfo) {
  await connectDB();
  const hubCodes = await resolveHubScope(session);
  const filter = applyHubScope(
    {
      ...NOT_DELETED_FILTER,
      rideStatus: { $in: ["In Ride", "Ready For Pickup", "Reserved"] },
    },
    hubCodes,
    ["currentHub", "startHub"]
  );

  const rows = await Booking.find(filter)
    .select(
      "bookingId userName userPhone vehicleId rentalMode rideStatus rentalEndDate riderPhoneLat riderPhoneLng riderPhoneUpdatedAt"
    )
    .sort({ rentalEndDate: 1 })
    .limit(50)
    .lean()
    .maxTimeMS(4000);

  const mapped: RiderSafetyRow[] = rows.map((row) => {
    const lat = Number(row.riderPhoneLat);
    const lng = Number(row.riderPhoneLng);
    const hasPhoneGps =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat !== 0 &&
      lng !== 0;
    const minutes = minutesUntil(row.rentalEndDate);
    return {
      bookingId: String(row.bookingId || ""),
      userName: String(row.userName || ""),
      userPhone: String(row.userPhone || ""),
      vehicleId: String(row.vehicleId || ""),
      rentalMode: String(row.rentalMode || ""),
      rideStatus: String(row.rideStatus || ""),
      rentalEndDate: row.rentalEndDate
        ? new Date(row.rentalEndDate).toISOString()
        : "",
      minutesUntilEnd: minutes,
      alertLevel: alertLevelForMinutes(minutes),
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
