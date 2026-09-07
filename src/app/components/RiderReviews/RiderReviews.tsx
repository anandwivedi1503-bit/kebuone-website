"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type PublicReview = {
  stars?: number;
  comment?: string;
  displayName?: string;
  city?: string;
  hubCode?: string;
};

type Summary = { average: number; count: number };

export default function RiderReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0 });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews/public")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (Array.isArray(json.data)) setReviews(json.data);
        if (json.summary) setSummary(json.summary);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hasReviews = reviews.length > 0;

  return (
    <section className="relative bg-[#FBF9F5] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <span className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#5F6B63]">
          Rider ratings
        </span>
        <h2 className="font-display mt-4 text-4xl font-medium tracking-[-0.03em] text-[#1C1917] sm:text-5xl">
          From people who{" "}
          <span className="italic text-[#1F6B4A]">already rode.</span>
        </h2>
        <p className="mt-4 max-w-xl text-[15px] leading-8 text-[#5C635E]">
          After a completed rental (or a paid Rent to Own day), riders can rate the scooter and hub.
          {summary.count
            ? ` ${summary.count} published rating${summary.count === 1 ? "" : "s"} · ${summary.average.toFixed(1)} / 5.`
            : " Published scores will land here as the yard grows."}
        </p>

        {hasReviews ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 6).map((review, index) => (
              <motion.blockquote
                key={`${review.displayName}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-t border-[#E4DDD2] pt-6"
              >
                <p className="text-amber-600" aria-label={`${review.stars || 0} stars`}>
                  {"★".repeat(Number(review.stars || 0))}
                  {"☆".repeat(Math.max(0, 5 - Number(review.stars || 0)))}
                </p>
                <p className="mt-3 text-[15px] leading-7 text-[#1C1917]">
                  “{review.comment}”
                </p>
                <footer className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[#1F6B4A]">
                  {review.displayName || "EVUDDY rider"}
                  {review.city ? ` · ${review.city}` : ""}
                </footer>
              </motion.blockquote>
            ))}
          </div>
        ) : (
          <p className="mt-10 max-w-lg text-sm leading-7 text-[#5C635E]">
            No public reviews yet. Complete a ride on Book EV and leave stars — 4 and 5 star comments
            can appear here after they are saved.
          </p>
        )}
      </div>
    </section>
  );
}
