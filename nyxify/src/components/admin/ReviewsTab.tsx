"use client";
import { useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  body: string;
  featured: boolean;
  createdAt: string;
  customer: { username: string };
  order: { service: string };
};

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  }

  async function toggleFeatured(id: string, current: boolean) {
    setTogglingId(id);
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current })
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, featured: !current } : r)));
    }
    setTogglingId(null);
  }

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Reviews</h2>
      <p className="mt-1 text-sm text-nyx-muted">
        Feature a review to show it on the homepage. Delete anything inappropriate or that shouldn't stay public.
      </p>

      {loading && <p className="mt-6 text-sm text-nyx-muted">Loading…</p>}

      <div className="mt-6 space-y-3">
        {reviews.length === 0 && !loading && <p className="text-sm text-nyx-muted">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="nyx-card flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-nyx-pink2">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="text-xs text-nyx-muted">
                  {r.customer.username} · {r.order.service} · {new Date(r.createdAt).toDateString()}
                </span>
                {r.featured && (
                  <span className="rounded-full bg-nyx-pink/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-nyx-pink2">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-white">{r.body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => toggleFeatured(r.id, r.featured)}
                disabled={togglingId === r.id}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                  r.featured
                    ? "border-nyx-pink bg-nyx-pink/15 text-nyx-pink2"
                    : "border-nyx-line text-white hover:border-nyx-pink"
                }`}
              >
                {togglingId === r.id ? "…" : r.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingId === r.id}
                className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deletingId === r.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
