import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") redirect("/");

  return <AdminDashboard />;
}
