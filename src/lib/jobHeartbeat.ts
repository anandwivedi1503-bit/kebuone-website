import JobHeartbeat from "@/models/JobHeartbeat";

export async function recordJobHeartbeat(
  jobId: string,
  detail: Record<string, unknown> = {}
) {
  try {
    await JobHeartbeat.findByIdAndUpdate(
      jobId,
      {
        $set: {
          lastRunAt: new Date(),
          ok: true,
          detail,
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error("JOB HEARTBEAT:", jobId, error);
  }
}

export async function readJobHeartbeat(jobId: string) {
  const row = (await JobHeartbeat.findById(jobId).lean()) as {
    lastRunAt?: Date;
    ok?: boolean;
    detail?: Record<string, unknown>;
  } | null;
  if (!row?.lastRunAt) {
    return {
      jobId,
      lastRunAt: null as Date | null,
      ageMs: null as number | null,
      stale: true,
      ok: false,
      detail: {},
    };
  }
  const lastRunAt = new Date(row.lastRunAt);
  const ageMs = Date.now() - lastRunAt.getTime();
  return {
    jobId,
    lastRunAt,
    ageMs,
    stale: ageMs > 2 * 60 * 60 * 1000,
    ok: Boolean(row.ok),
    detail: row.detail || {},
  };
}
