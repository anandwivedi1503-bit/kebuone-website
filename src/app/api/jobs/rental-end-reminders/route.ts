import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { recordJobHeartbeat } from "@/lib/jobHeartbeat";
import { notifyRentalEndReminder } from "@/lib/notify/rentalEndReminder";
import { rentalEndAtStart } from "@/lib/rentalSchedule";
import { providedSecretMatches } from "@/lib/timingSafe";
import Booking from "@/models/Booking";

export const runtime = "nodejs";

const NOT_DELETED = {
  $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};
const NOT_SENT = { $in: [null] };
const NOT_RTO = { $nin: [/^rto$/i, /rent\s*to\s*own/i] };

export async function POST(req: Request) {
  if (
    !providedSecretMatches(
      process.env.CRON_SECRET || "",
      req.headers.get("x-cron-secret") || ""
    )
  ) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const dueBy = new Date(now.getTime() + 60 * 60 * 1000);
  const staleClaim = new Date(now.getTime() - 15 * 60 * 1000);

  try {
    await connectDB();
    const activeRides = await Booking.find({
      $and: [
        NOT_DELETED,
        {
          rideStatus: "In Ride",
          rentalMode: NOT_RTO,
          riderEndReminderSentAt: NOT_SENT,
          $or: [
            { riderEndReminderClaimedAt: { $in: [null] } },
            { riderEndReminderClaimedAt: { $lt: staleClaim } },
          ],
        },
      ],
    })
      .sort({ actualRideStart: 1 })
      .limit(500)
      .select("bookingId userName userPhone userEmail rentalMode rentalHours rentToOwnMonths actualRideStart")
      .lean();
    const candidates = activeRides
      .map((booking) => ({
        booking,
        rentalEndDate: booking.actualRideStart
          ? rentalEndAtStart(
              new Date(booking.actualRideStart),
              String(booking.rentalMode || ""),
              Number(booking.rentalHours || 1),
              Number(booking.rentToOwnMonths || 20)
            )
          : null,
      }))
      .filter(
        (candidate) =>
          candidate.rentalEndDate &&
          candidate.rentalEndDate > now &&
          candidate.rentalEndDate <= dueBy
      )
      .sort((a, b) => a.rentalEndDate!.getTime() - b.rentalEndDate!.getTime())
      .slice(0, 30);

    const outcomes = await Promise.all(
      candidates.map(async (candidate) => {
        const endAt = candidate.rentalEndDate!;
        const claimedAt = new Date();
        const claim = await Booking.findOneAndUpdate(
          {
            _id: candidate.booking._id,
            rideStatus: "In Ride",
            rentalMode: NOT_RTO,
            actualRideStart: candidate.booking.actualRideStart,
            riderEndReminderSentAt: NOT_SENT,
            $or: [
              { riderEndReminderClaimedAt: { $in: [null] } },
              { riderEndReminderClaimedAt: { $lt: staleClaim } },
            ],
          },
          {
            $set: {
              riderEndReminderClaimedAt: claimedAt,
              rentalEndDate: endAt,
              expectedReturnDate: endAt,
            },
          },
          { new: true }
        );
        if (!claim) return { skipped: true };

        try {
          const result = await notifyRentalEndReminder({
            bookingId: String(claim.bookingId || ""),
            riderName: String(claim.userName || ""),
            riderPhone: String(claim.userPhone || ""),
            riderEmail: String(claim.userEmail || ""),
            endsAtIso: claim.rentalEndDate
              ? new Date(claim.rentalEndDate).toISOString()
              : "",
            duration: String(claim.rentalMode || ""),
            units:
              claim.rentalMode === "Hourly"
                ? Number(claim.rentalHours) || 1
                : undefined,
            leadMinutes: 60,
          });
          const delivered = result.emailSent || result.smsSent;
          await Booking.updateOne(
            { _id: claim._id, riderEndReminderClaimedAt: claimedAt },
            {
              ...(delivered ? { $set: { riderEndReminderSentAt: new Date() } } : {}),
              $unset: { riderEndReminderClaimedAt: 1 },
            }
          );
          return { delivered, emailSent: result.emailSent, smsSent: result.smsSent };
        } catch (error) {
          await Booking.updateOne(
            { _id: claim._id, riderEndReminderClaimedAt: claimedAt },
            { $unset: { riderEndReminderClaimedAt: 1 } }
          );
          return { failed: true, error: String(error) };
        }
      })
    );

    const delivered = outcomes.filter(
      (item) => "delivered" in item && item.delivered
    ).length;
    const failed = outcomes.filter((item) => "failed" in item).length;
    const result = { checked: candidates.length, delivered, failed };
    await recordJobHeartbeat("rentalEndReminders", result, failed === 0);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error);
    await recordJobHeartbeat("rentalEndReminders", { error: message }, false);
    return NextResponse.json(
      { success: false, message: "Rental reminders could not be processed." },
      { status: 500 }
    );
  }
}
