"use client";
import { useEffect, useState } from "react";

const CATEGORIES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

type StoreItem = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  image: string;
  category: string;
};

export default function StoreTab() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("CLOTHING");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadItems() {
    fetch("/api/store")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Posting…");
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price, category, image })
    });
    setStatus(res.ok ? "Posted to the store." : "Something went wrong.");
    if (res.ok) {
      setTitle("");
      setDescription("");
      setPrice("");
      setImage("");
      loadItems();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/store/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Store</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">Post new item</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              required
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <textarea
              required
              rows={3}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <input
              required
              type="number"
              step="0.01"
              min="0"
              placeholder="Price (e.g. 25.00)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              required
              placeholder="Image URL (already uploaded to storage)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-6 py-3 font-semibold text-white shadow-glow hover:opacity-90"
            >
              Post to store
            </button>
            {status && <p className="text-sm text-nyx-muted">{status}</p>}
          </form>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">Current store items</h3>
          <div className="mt-4 space-y-3">
            {items.length === 0 && <p className="text-sm text-nyx-muted">Nothing posted yet.</p>}
            {items.map((item) => (
              <div key={item.id} className="nyx-card flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-nyx-muted">{item.category} · ${(item.priceCents / 100).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
