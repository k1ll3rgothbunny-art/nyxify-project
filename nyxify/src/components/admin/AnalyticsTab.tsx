"use client";
import { useEffect, useState } from "react";

type Analytics = {
  revenueCents: number;
  ordersThisMonth: number;
  pendingPayments: number;
  totalCustomers: number;
  returningCustomers: number;
  averageOrderValueCents: number;
  bestSellingServices: { service: string; count: number }[];
};

export default function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-nyx-muted">Loading…</div>;

  const cards = [
    { label: "Total revenue", value: `$${(data.revenueCents / 100).toFixed(2)}` },
    { label: "Orders this month", value: String(data.ordersThisMonth) },
    { label: "Pending payments", value: String(data.pendingPayments) },
    { label: "Total customers", value: String(data.totalCustomers) },
    { label: "Returning customers", value: String(data.returningCustomers) },
    { label: "Average order value", value: `$${(data.averageOrderValueCents / 100).toFixed(2)}` }
  ];

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Analytics</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="nyx-card p-5">
            <p className="text-xs uppercase tracking-wide text-nyx-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h3 className="nyx-heading text-lg font-bold text-white">Best-selling services</h3>
        <div className="mt-4 space-y-2">
          {data.bestSellingServices.map((s) => (
            <div key={s.service} className="nyx-card flex items-center justify-between p-4">
              <span className="text-white">{s.service}</span>
              <span className="text-nyx-muted">{s.count} orders</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
