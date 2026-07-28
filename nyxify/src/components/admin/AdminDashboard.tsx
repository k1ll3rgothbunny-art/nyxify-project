"use client";
import { useState } from "react";
import OverviewTab from "./OverviewTab";
import OrdersTab from "./OrdersTab";
import ShowcasesTab from "./ShowcasesTab";
import StoreTab from "./StoreTab";
import ReviewsTab from "./ReviewsTab";
import AnalyticsTab from "./AnalyticsTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "showcases", label: "Showcases" },
  { key: "store", label: "Store" },
  { key: "reviews", label: "Reviews" },
  { key: "analytics", label: "Analytics" }
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard() {
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Admin</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-nyx-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active === tab.key
                ? "border-nyx-pink text-white"
                : "border-transparent text-nyx-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {active === "overview" && <OverviewTab onViewAllOrders={() => setActive("orders")} />}
        {active === "orders" && <OrdersTab />}
        {active === "showcases" && <ShowcasesTab />}
        {active === "store" && <StoreTab />}
        {active === "reviews" && <ReviewsTab />}
        {active === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}
