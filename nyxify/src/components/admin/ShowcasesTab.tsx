"use client";
import { useEffect, useState } from "react";

const CATEGORIES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

type Showcase = {
  id: string;
  title: string;
  category: string;
  images: string[];
  completedAt: string;
};

export default function ShowcasesTab() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CLOTHING");
  const [imageUrls, setImageUrls] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadShowcases() {
    fetch("/api/showcases")
      .then((r) => r.json())
      .then((data) => setShowcases(Array.isArray(data) ? data : []));
  }

  useEffect(() => {
    loadShowcases();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Posting…");
    const res = await fetch("/api/showcases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        images: imageUrls.split("\n").map((s) => s.trim()).filter(Boolean),
        completedAt: new Date().toISOString()
      })
    });
    setStatus(res.ok ? "Posted — synced to the Discord portfolio channel." : "Something went wrong.");
    if (res.ok) {
      setTitle("");
      setDescription("");
      setImageUrls("");
      loadShowcases();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/showcases/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShowcases((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Showcases</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">Upload new</h3>
          <p className="mt-1 text-xs text-nyx-muted">Posting here also sends the preview to your Discord Portfolio channel automatically.</p>
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              required
              rows={3}
              placeholder="Image URLs, one per line (already uploaded to storage)"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-6 py-3 font-semibold text-white shadow-glow hover:opacity-90"
            >
              Post showcase
            </button>
            {status && <p className="text-sm text-nyx-muted">{status}</p>}
          </form>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">Existing showcases</h3>
          <div className="mt-4 space-y-3">
            {showcases.length === 0 && <p className="text-sm text-nyx-muted">Nothing posted yet.</p>}
            {showcases.map((s) => (
              <div key={s.id} className="nyx-card flex items-center gap-3 p-3">
                {s.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.images[0]} alt={s.title} className="h-14 w-14 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{s.title}</p>
                  <p className="text-xs text-nyx-muted">{s.category}</p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === s.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
