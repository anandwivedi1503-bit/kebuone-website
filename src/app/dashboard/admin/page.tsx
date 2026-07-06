import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import DashboardContainer from "../../components/DashboardContainer/DashboardContainer";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin-login");
  }

  return <DashboardContainer />;
}