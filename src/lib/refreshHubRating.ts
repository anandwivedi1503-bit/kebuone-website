import Hub from "@/models/Hub";
import Review from "@/models/Review";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";

export async function refreshHubCustomerRating(hubCode: unknown) {
  const code = String(hubCode || "").trim().toUpperCase();
  if (!code) return;

  const [agg] = await Review.aggregate([
    {
      $match: {
        hubCode: code,
        status: "Published",
        ...NOT_DELETED_FILTER,
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$stars" },
        n: { $sum: 1 },
      },
    },
  ]);

  const ratingsCount = Number(agg?.n || 0);
  const customerRating = ratingsCount
    ? Number(Number(agg.avg).toFixed(2))
    : 0;

  await Hub.updateOne(
    { hubCode: code },
    { $set: { customerRating, ratingsCount } }
  );
}
