"use client";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = [
  "AWAITING_QUOTE", "AWAITING_PAYMENT", "PAID", "IN_PROGRESS",
  "WAITING_ON_CUSTOMER", "REVISION_REQUESTED", "COMPLETED", "ARCHIVED"
];
const DONE_STATUSES = ["COMPLETED", "ARCHIVED"];

type Order = {
  id: string;
  service: string;
  status: string;
  quoteCents: number | null;
  customer: { username: string };
  createdAt: string;
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "done">("active");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function updateOrder(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    }
  }

  async function deleteOrder(id: string, customerName: string) {
    if (!confirm(`Delete this order from ${customerName}? This also deletes its Discord ticket channel and can't be undone.`)) {
      return;
    }
    setDeletingId(id);
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    setDeletingId(null);
  }

  const activeOrders = orders.filter((o) => !DONE_STATUSES.includes(o.status));
  const doneOrders = orders.filter((o) => DONE_STATUSES.includes(o.status));
  const visibleOrders = view === "active" ? activeOrders : doneOrders;

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Orders</h2>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setView("active")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            view === "active" ? "bg-nyx-pink text-white" : "border border-nyx-line text-nyx-muted hover:text-white"
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setView("done")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            view === "done" ? "bg-nyx-pink text-white" : "border border-nyx-line text-nyx-muted hover:text-white"
          }`}
        >
          Completed & Archived ({doneOrders.length})
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-nyx-muted">Loading…</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-nyx-muted">
              <th className="px-3">Customer</th>
              <th className="px-3">Service</th>
              <th className="px-3">Status</th>
              <th className="px-3">Quote ($)</th>
              <th className="px-3">Update status</th>
              <th className="px-3"></th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((o) => (
              <tr key={o.id} className="nyx-card text-sm">
                <td className="px-3 py-3 text-white">{o.customer.username}</td>
                <td className="px-3 py-3 text-nyx-muted">{o.service}</td>
                <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-3 py-3">
                  <input
                    type="number"
                    defaultValue={o.quoteCents ? o.quoteCents / 100 : ""}
                    onBlur={(e) => {
                      const dollars = parseFloat(e.target.value);
                      if (!Number.isNaN(dollars)) {
                        updateOrder(o.id, { quoteCents: Math.round(dollars * 100), status: "AWAITING_PAYMENT" });
                      }
                    }}
                    className="w-24 rounded-lg border border-nyx-line bg-nyx-panel px-2 py-1 text-white"
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                    className="rounded-lg border border-nyx-line bg-nyx-panel px-2 py-1 text-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => deleteOrder(o.id, o.customer.username)}
                    disabled={deletingId === o.id}
                    className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === o.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {visibleOrders.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-nyx-muted">
                  {view === "active" ? "No active orders." : "Nothing completed or archived yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
