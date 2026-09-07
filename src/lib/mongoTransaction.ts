import mongoose from "mongoose";

export function isMongoTransactionUnsupported(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /Transaction numbers are only allowed|replica set member|Transactions? (are )?not supported/i.test(
    message
  );
}

export class MongoReplicaRequiredError extends Error {
  constructor() {
    super("MONEY_REPLICA_REQUIRED");
    this.name = "MongoReplicaRequiredError";
  }
}

export function isMongoReplicaRequiredError(error: unknown) {
  return (
    error instanceof MongoReplicaRequiredError ||
    (error instanceof Error && error.message === "MONEY_REPLICA_REQUIRED")
  );
}

export const MONEY_REPLICA_MESSAGE =
  "Payments need a Mongo replica set. No money was taken. Enable replica set, then retry.";

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

/** Money writes must not continue on standalone Mongo. */
export async function startRequiredTransaction(): Promise<mongoose.ClientSession> {
  const session = await startOptionalTransaction();
  if (!session) throw new MongoReplicaRequiredError();
  return session;
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

/** Replica-set transaction only — never sequential money writes. */
export async function runMongoTransaction<T>(
  work: (session: mongoose.ClientSession) => Promise<T>
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
        throw new MongoReplicaRequiredError();
      }
      throw error;
    }
  } finally {
    await session.endSession();
  }
}
