import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getAdminSnapshot } from "@/lib/admin-data";
import { AdminPortal } from "@/components/admin/AdminPortal";

export default async function AdminPage() {
  const [user, admin] = await Promise.all([getCurrentUser(), getCurrentAdmin()]);

  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  if (!admin) {
    redirect("/");
  }

  const snapshot = await getAdminSnapshot();

  return <AdminPortal admin={admin} snapshot={snapshot} />;
}
