import AuditLog from "@/models/AuditLog";

export async function writeAudit(input: {
  actor?: string;
  action: string;
  entity: string;
  entityId?: string;
  riderId?: string;
  bookingId?: string;
  detail?: string;
}) {
  try {
    await AuditLog.create({
      actor: input.actor || "System",
      action: input.action,
      entity: input.entity,
      entityId: input.entityId || "",
      riderId: input.riderId || "",
      bookingId: input.bookingId || "",
      detail: String(input.detail || "").slice(0, 500),
    });
  } catch (error) {
    console.error("AUDIT LOG SKIPPED:", error);
  }
}
