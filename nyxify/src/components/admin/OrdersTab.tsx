"use client";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = [
  "AWAITING_QUOTE", "AWAITING_PAYMENT", "PAID", "IN_PROGRESS",
  "WAITING_ON_CUSTOMER", "REVISION_REQUESTED", "COMPLETED", "ARCHIVED"
];

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

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Orders</h2>

      {loading && <p className="mt-6 text-sm text-nyx-muted">Loading…</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-nyx-muted">
              <th className="px-3">Customer</th>
              <th className="px-3">Service</th>
              <th className="px-3">Status</th>
              <th className="px-3">Quote ($)</th>
              <th className="px-3">Update status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
