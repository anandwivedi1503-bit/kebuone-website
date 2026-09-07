import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import { sanitizeReviewComment } from "@/lib/reviews";
import Review from "@/models/Review";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const [reviews, summary] = await Promise.all([
      Review.find({
        ...NOT_DELETED_FILTER,
        status: "Published",
        comment: { $ne: "" },
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select("stars comment displayName hubCode city createdAt wouldRecommend")
        .lean(),
      Review.aggregate([
        { $match: { ...NOT_DELETED_FILTER, status: "Published" } },
        {
          $group: {
            _id: null,
            avg: { $avg: "$stars" },
            n: { $sum: 1 },
          },
        },
      ]),
    ]);

    const avg = Number(summary[0]?.avg || 0);
    const count = Number(summary[0]?.n || 0);

    return NextResponse.json({
      success: true,
      data: reviews.map((row) => ({
        stars: row.stars,
        comment: sanitizeReviewComment(row.comment, 280),
        displayName: row.displayName,
        hubCode: row.hubCode,
        city: row.city,
        createdAt: row.createdAt,
        wouldRecommend: row.wouldRecommend,
      })),
      summary: {
        average: count ? Number(avg.toFixed(2)) : 0,
        count,
      },
    });
  } catch (error) {
    console.error("REVIEWS PUBLIC ERROR:", error);
    return NextResponse.json({
      success: true,
      data: [],
      summary: { average: 0, count: 0 },
    });
  }
}
