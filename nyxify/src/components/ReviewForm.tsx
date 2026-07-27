"use client";
import { useState } from "react";

export default function ReviewForm({ orderId, onSubmitted }: { orderId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, body, screenshots: [] })
    });
    setSubmitting(false);
    if (res.ok) {
      onSubmitted();
    } else {
      setError("Couldn't submit that review — try again in a moment.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-nyx-line bg-nyx-panel2 p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-nyx-pink2" : "text-nyx-line"}`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        required
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was your order?"
        className="w-full rounded-lg border border-nyx-line bg-nyx-panel px-3 py-2 text-sm text-white placeholder:text-nyx-muted/60 focus:border-nyx-pink focus:outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
