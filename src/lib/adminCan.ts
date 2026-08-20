import type { AdminSessionInfo } from "@/lib/adminAuth";

export function sessionCanOpen(
  session: AdminSessionInfo | null,
  dashboard: string
) {
  if (!session) return false;
  if (session.role === "super") return true;
  return session.dashboards.includes(dashboard);
}
