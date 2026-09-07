import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { nextSeqId } from "@/lib/nextSeqId";
import { publicApiError } from "@/lib/publicError";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import {
  bookingEligibleForReview,
  clampStars,
  defaultReviewStatus,
  riderPublicDisplayName,
  sanitizeReviewComment,
} from "@/lib/reviews";
import { refreshHubCustomerRating } from "@/lib/refreshHubRating";
import { writeAudit } from "@/lib/writeAudit";
import {
  isAdminAuthenticated,
  requireAdminDashboards,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import {
  applyOpsListFilters,
  listResponseFromPage,
  parseListQuery,
} from "@/lib/listQuery";
import { idInScopeFilter, scopedBookingIds } from "@/lib/staffHubScope";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Rider from "@/models/Rider";
import { bookingBelongsToRiderFilter, findBookingRider } from "@/lib/findBookingRider";

export const runtime = "nodejs";

async function loadSignedInRider(req: Request) {
  const firebaseUser = await getVerifiedFirebaseUser(req);
  if (!firebaseUser) return { firebaseUser: null, rider: null as null };

  const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
    { firebaseUid: firebaseUser.uid },
  ];
  if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

  const rider = await Rider.findOne({
    $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
  });

  if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
    return { firebaseUser, rider: null };
  }

  return { firebaseUser, rider };
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimitAllowed(`reviews:${clientIp(req)}`, 8, 10 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, message: "Too many review attempts. Try again later." },
        { status: 429 }
      );
    }

    await connectDB();
    const { firebaseUser, rider } = await loadSignedInRider(req);
    if (!firebaseUser) {
      return NextResponse.json(
        { success: false, message: "Sign in required." },
        { status: 401 }
      );
    }
    if (!rider) {
      return NextResponse.json(
        { success: false, message: "Rider profile not found." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const bookingId = String(body.bookingId || "").trim().toUpperCase();
    const stars = clampStars(body.stars);
    const vehicleStars = clampStars(body.vehicleStars, stars);
    const hubStars = clampStars(body.hubStars, stars);
    const comment = sanitizeReviewComment(body.comment);
    const wouldRecommend = body.wouldRecommend !== false;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Booking ID is required." },
        { status: 400 }
      );
    }
    if (stars < 1) {
      return NextResponse.json(
        { success: false, message: "Please choose 1 to 5 stars." },
        { status: 400 }
      );
    }
    if (comment.length > 0 && comment.length < 8) {
      return NextResponse.json(
        { success: false, message: "Write a short comment (at least 8 characters) or leave it empty." },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      $and: [
        bookingBelongsToRiderFilter(rider),
        NOT_DELETED_FILTER,
        { bookingId },
      ],
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const owner = await findBookingRider(booking);
    if (!owner || !firebaseUserOwnsRider(firebaseUser, owner)) {
      return NextResponse.json(
        { success: false, message: "This booking is not yours." },
        { status: 403 }
      );
    }

    if (!bookingEligibleForReview(booking)) {
      return NextResponse.json(
        {
          success: false,
          message: "You can rate after the ride is completed (or after the first Rent to Own payment).",
        },
        { status: 409 }
      );
    }

    const existing = await Review.findOne({
      ...NOT_DELETED_FILTER,
      bookingId,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You already reviewed this booking.", data: existing },
        { status: 409 }
      );
    }

    const status = defaultReviewStatus(stars);
    const reviewId = await nextSeqId("RV", "review");
    const hubCode = String(booking.startHub || booking.currentHub || "")
      .trim()
      .toUpperCase();

    const [review] = await Review.create([
      {
        reviewId,
        bookingId,
        riderId: String(rider.riderId || booking.riderId || "").toUpperCase(),
        displayName: riderPublicDisplayName(rider.fullName),
        vehicleId: String(booking.vehicleId || "").toUpperCase(),
        hubCode,
        city: String(booking.pickupCity || ""),
        stars,
        vehicleStars: vehicleStars || stars,
        hubStars: hubStars || stars,
        comment,
        wouldRecommend,
        status,
      },
    ]);

    booking.reviewId = reviewId;
    booking.reviewedAt = new Date();
    await booking.save();

    if (status === "Published") {
      await refreshHubCustomerRating(hubCode);
    }

    void writeAudit({
      actor: "Rider",
      action: "REVIEW_CREATED",
      entity: "Review",
      entityId: reviewId,
      riderId: String(rider.riderId || ""),
      bookingId,
      detail: `${stars}★ ${status}`,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    const duplicate =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      Number((error as { code?: number }).code) === 11000;
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "You already reviewed this booking." },
        { status: 409 }
      );
    }
    console.error("REVIEW POST ERROR:", error);
    return NextResponse.json(
      { success: false, message: publicApiError(error, "Unable to save review.") },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Sign in required." },
        { status: 401 }
      );
    }
    const gate = await requireAdminDashboards(...API_DASHBOARDS.reviews);
    if (gate.error) return gate.error;

    await connectDB();
    const parsed = parseListQuery(req);
    const { page, limit, skip, q } = parsed;
    const status = String(new URL(req.url).searchParams.get("status") || "").trim();
    const filter: Record<string, unknown> = { ...NOT_DELETED_FILTER };
    applyOpsListFilters(filter, parsed, { hub: "hubCode", city: "city" });
    const bookingIds = await scopedBookingIds(gate.session);
    Object.assign(filter, idInScopeFilter("bookingId", bookingIds));
    if (status && ["Pending", "Published", "Hidden"].includes(status)) {
      filter.status = status;
    }
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(escaped, "i");
      filter.$or = [
        { reviewId: rx },
        { bookingId: rx },
        { riderId: rx },
        { displayName: rx },
        { comment: rx },
        { hubCode: rx },
      ];
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    return NextResponse.json(listResponseFromPage(reviews, page, limit));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: publicApiError(error, "Unable to load reviews.") },
      { status: 500 }
    );
  }
}
