"use client";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import RegisterDiscordCommandButton from "@/components/RegisterDiscordCommandButton";

type Order = {
  id: string;
  service: string;
  status: string;
  customer: { username: string };
  createdAt: string;
};

export default function OverviewTab({ onViewAllOrders }: { onViewAllOrders: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data.slice(0, 8) : []));
  }, []);

  return (
    <div>
      <div className="nyx-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-semibold text-white">Discord /deliver command</p>
          <p className="text-sm text-nyx-muted">
            Run once so you can drop completed files right into a ticket channel with{" "}
            <code className="text-nyx-pink2">/deliver</code>.
          </p>
        </div>
        <RegisterDiscordCommandButton />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="nyx-heading text-xl font-bold text-white">Recent activity</h2>
        <button onClick={onViewAllOrders} className="text-sm text-nyx-pink2 hover:underline">
          View all orders
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="nyx-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-semibold text-white">{o.customer.username} — {o.service}</p>
              <p className="text-xs text-nyx-muted">{new Date(o.createdAt).toDateString()}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-nyx-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
