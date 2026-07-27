import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || role !== "ADMIN") redirect("/");

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { customer: true }
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="nyx-heading text-3xl font-bold text-white">Admin</h1>
        <nav className="flex gap-4 text-sm text-nyx-pink2">
          <Link href="/admin/orders" className="hover:underline">Orders</Link>
          <Link href="/admin/showcases" className="hover:underline">Showcases</Link>
          <Link href="/admin/analytics" className="hover:underline">Analytics</Link>
        </nav>
      </div>

      <section className="mt-10">
        <h2 className="nyx-heading text-xl font-bold text-white">Recent activity</h2>
        <div className="mt-4 space-y-3">
          {recentOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders?id=${o.id}`}
              className="nyx-card flex flex-wrap items-center justify-between gap-3 p-5 hover:border-nyx-pink/50"
            >
              <div>
                <p className="font-semibold text-white">{o.customer.username} — {o.service}</p>
                <p className="text-xs text-nyx-muted">{o.createdAt.toDateString()}</p>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
