import type { ClientSession } from "mongoose";

import Counter from "@/models/Counter";

/** Atomic prefixed IDs (RF-, TK-, WTX- style) — safer than Date.now() under concurrency. */
export async function nextSeqId(
  prefix: string,
  counterId: string,
  pad = 8,
  session?: ClientSession | null
) {
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      session: session || undefined,
    }
  );

  if (!counter) {
    throw new Error(`Failed to generate ${prefix} ID.`);
  }

  return `${prefix}-${String(counter.seq).padStart(pad, "0")}`;
}
