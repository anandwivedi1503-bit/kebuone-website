import mongoose from "mongoose";

export function isMongoTransactionUnsupported(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Transaction numbers are only allowed|replica set member|Transactions? (are )?not supported/i.test(
    message
  );
}

export function sessionOpts(session: mongoose.ClientSession | null | undefined) {
  return session ? { session } : {};
}

/** Start a replica-set transaction, or null on standalone Mongo. */
export async function startOptionalTransaction(): Promise<mongoose.ClientSession | null> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    return session;
  } catch (error) {
    try {
      await session.endSession();
    } catch {}
    if (isMongoTransactionUnsupported(error)) return null;
    throw error;
  }
}

export async function commitOptionalTransaction(session: mongoose.ClientSession | null) {
  if (!session) return;
  await session.commitTransaction();
  await session.endSession();
}

export async function abortOptionalTransaction(session: mongoose.ClientSession | null) {
  if (!session) return;
  try {
    await session.abortTransaction();
  } catch {}
  try {
    await session.endSession();
  } catch {}
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
