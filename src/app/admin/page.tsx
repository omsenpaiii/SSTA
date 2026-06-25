import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { getAdminSnapshot } from "@/lib/admin-data";
import { AdminPortal } from "@/components/admin/AdminPortal";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const snapshot = await getAdminSnapshot();

  return <AdminPortal admin={admin} snapshot={snapshot} />;
}
