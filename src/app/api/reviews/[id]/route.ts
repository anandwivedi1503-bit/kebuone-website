import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireAdminDashboards, unauthorizedResponse } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { publicApiError } from "@/lib/publicError";
import { isReviewStatus, sanitizeReviewComment } from "@/lib/reviews";
import { refreshHubCustomerRating } from "@/lib/refreshHubRating";
import { writeAudit } from "@/lib/writeAudit";
import { denyIfBookingOutOfHub } from "@/lib/staffHubScope";
import Review from "@/models/Review";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.reviews);
    if (gate.error) return gate.error;
    if (!gate.session) return unauthorizedResponse();

    await connectDB();
    const { id } = await context.params;
    const body = await req.json();
    const lookup: Record<string, unknown>[] = [
      { reviewId: String(id || "").toUpperCase() },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      lookup.push({ _id: id });
    }
    const review = await Review.findOne({
      $and: [NOT_DELETED_FILTER, { $or: lookup }],
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found." },
        { status: 404 }
      );
    }

    const hubBlock = await denyIfBookingOutOfHub(gate.session, review.bookingId);
    if (hubBlock) return hubBlock;

    const nextStatus = body.status;
    if (nextStatus !== undefined) {
      if (!isReviewStatus(nextStatus)) {
        return NextResponse.json(
          { success: false, message: "Invalid review status." },
          { status: 400 }
        );
      }
      review.status = nextStatus;
    }

    if (body.staffReply !== undefined) {
      review.staffReply = sanitizeReviewComment(body.staffReply, 500);
    }

    await review.save();
    await refreshHubCustomerRating(review.hubCode);

    void writeAudit({
      actor: gate.session.username,
      action: "REVIEW_UPDATED",
      entity: "Review",
      entityId: review.reviewId,
      bookingId: review.bookingId,
      riderId: review.riderId,
      detail: `${review.status}${review.staffReply ? " + reply" : ""}`,
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: publicApiError(error, "Unable to update review.") },
      { status: 500 }
    );
  }
}
