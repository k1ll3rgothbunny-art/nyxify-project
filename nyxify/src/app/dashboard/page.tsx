import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import PayPalButton from "@/components/PayPalButton";
import CashAppPayButton from "@/components/CashAppPayButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      notifications: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  });

  if (!user) redirect("/login");

  const active = user.orders.filter((o) => o.status !== "COMPLETED" && o.status !== "ARCHIVED");
  const past = user.orders.filter((o) => o.status === "COMPLETED" || o.status === "ARCHIVED");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="nyx-heading text-3xl font-bold text-white">Welcome back, {user.username}</h1>
          {user.vipTier && (
            <span className="mt-2 inline-block rounded-full bg-nyx-pink/15 px-3 py-1 text-xs font-semibold text-nyx-pink2">
              {user.vipTier} Tier
            </span>
          )}
        </div>
        <Link href="/dashboard/vault" className="rounded-full border border-nyx-line px-5 py-2 text-sm text-white hover:border-nyx-pink">
          Open My Vault
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total spent" value={`$${(user.totalSpentCents / 100).toFixed(2)}`} />
        <StatCard label="Active orders" value={String(active.length)} />
        <StatCard label="Completed" value={String(past.filter((o) => o.status === "COMPLETED").length)} />
        <StatCard label="Notifications" value={String(user.notifications.filter((n) => !n.read).length)} />
      </div>

      <section className="mt-12">
        <h2 className="nyx-heading text-xl font-bold text-white">Active orders</h2>
        <div className="mt-4 space-y-3">
          {active.length === 0 && <p className="text-sm text-nyx-muted">No active orders right now.</p>}
          {active.map((o) => (
            <div key={o.id} className="nyx-card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-white">{o.service.charAt(0) + o.service.slice(1).toLowerCase()}</p>
                <p className="text-xs text-nyx-muted">
                  Placed {o.createdAt.toDateString()}
                  {o.quoteCents ? ` · Quote: $${(o.quoteCents / 100).toFixed(2)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={o.status} />
                {o.status === "AWAITING_PAYMENT" && o.quoteCents && (
                  <div className="flex flex-wrap items-center gap-3">
                    <PayPalButton orderId={o.id} payDeposit={!!o.depositCents} />
                    <CashAppPayButton
                      orderId={o.id}
                      amountCents={o.depositCents ?? o.quoteCents}
                      payDeposit={!!o.depositCents}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="nyx-heading text-xl font-bold text-white">Order history</h2>
        <div className="mt-4 space-y-3">
          {past.length === 0 && <p className="text-sm text-nyx-muted">No past orders yet.</p>}
          {past.map((o) => (
            <div key={o.id} className="nyx-card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-white">{o.service.charAt(0) + o.service.slice(1).toLowerCase()}</p>
                <p className="text-xs text-nyx-muted">Placed {o.createdAt.toDateString()}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="nyx-card p-5">
      <p className="text-xs uppercase tracking-wide text-nyx-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
