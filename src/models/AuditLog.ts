import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, default: "System", trim: true, maxlength: 80 },
    action: { type: String, required: true, trim: true, maxlength: 80, index: true },
    entity: { type: String, required: true, trim: true, maxlength: 40, index: true },
    entityId: { type: String, default: "", trim: true, index: true },
    riderId: { type: String, default: "", trim: true, index: true },
    bookingId: { type: String, default: "", trim: true, index: true },
    detail: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
