import mongoose from "mongoose";

export function isMongoTransactionUnsupported(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Transaction numbers are only allowed|replica set member|Transactions? (are )?not supported/i.test(
    message
  );
}

/** Replica-set transactions when available; standalone Mongo falls back to sequential writes. */
export async function runMongoTransaction<T>(
  work: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    let started = false;
    try {
      await session.withTransaction(async () => {
        started = true;
        result = await work(session);
      });
      return result;
    } catch (error) {
      if (!started && isMongoTransactionUnsupported(error)) {
        return work(null);
      }
      throw error;
    }
  } finally {
    await session.endSession();
  }
}
