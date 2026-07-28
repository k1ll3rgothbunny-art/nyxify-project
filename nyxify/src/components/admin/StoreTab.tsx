"use client";
import { useEffect, useState } from "react";
import { formatPriceRange } from "@/lib/format";

const CATEGORIES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

type StoreItem = {
  id: string;
  title: string;
  description: string;
  priceMinCents: number;
  priceMaxCents: number | null;
  image: string;
  category: string;
};

const emptyForm = { title: "", description: "", priceMin: "", priceMax: "", category: "CLOTHING", image: "" };

export default function StoreTab() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  function startEdit(item: StoreItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      priceMin: (item.priceMinCents / 100).toString(),
      priceMax: item.priceMaxCents ? (item.priceMaxCents / 100).toString() : "",
      category: item.category,
      image: item.image
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(editingId ? "Saving…" : "Posting…");
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      image: form.image,
      priceMin: form.priceMin,
      priceMax: form.priceMax || null
    };
    const res = editingId
      ? await fetch(`/api/store/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
    setStatus(res.ok ? (editingId ? "Saved." : "Posted to the store.") : "Something went wrong.");
    if (res.ok) {
      cancelEdit();
      loadItems();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/store/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) cancelEdit();
    }
    setDeletingId(null);
  }

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Store</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">
            {editingId ? "Edit item" : "Post new item"}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <textarea
              required
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <div className="flex gap-3">
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Price low (e.g. 10)"
                value={form.priceMin}
                onChange={(e) => setForm((f) => ({ ...f, priceMin: e.target.value }))}
                className="w-1/2 rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price high (optional)"
                value={form.priceMax}
                onChange={(e) => setForm((f) => ({ ...f, priceMax: e.target.value }))}
                className="w-1/2 rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
              />
            </div>
            <p className="text-xs text-nyx-muted">Leave "Price high" blank for a flat price instead of a range.</p>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              required
              placeholder="Image URL (already uploaded to storage)"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-6 py-3 font-semibold text-white shadow-glow hover:opacity-90"
              >
                {editingId ? "Save changes" : "Post to store"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border border-nyx-line px-6 py-3 font-semibold text-nyx-muted hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
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
                  <p className="text-xs text-nyx-muted">
                    {item.category} · {formatPriceRange(item.priceMinCents, item.priceMaxCents)}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(item)}
                  className="rounded-full border border-nyx-line px-3 py-1.5 text-xs font-semibold text-white hover:border-nyx-pink"
                >
                  Edit
                </button>
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
