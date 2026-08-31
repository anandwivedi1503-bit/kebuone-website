import type { ClientSession } from "mongoose";

import Counter from "@/models/Counter";

export async function nextBookingId(
  prefix: "BK" | "RTO",
  session?: ClientSession | null
) {
  const counter = await Counter.findByIdAndUpdate(
    prefix === "RTO" ? "rtoBookingSequence" : "bookingSequence",
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      session: session || undefined,
    }
  );

  if (!counter) {
    throw new Error("Failed to generate booking ID.");
  }

  return `${prefix}-${String(counter.seq).padStart(6, "0")}`;
}
