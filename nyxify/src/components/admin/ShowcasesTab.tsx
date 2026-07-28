"use client";
import { useEffect, useState } from "react";

const CATEGORIES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

type Showcase = {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  completedAt: string;
};

const emptyForm = { title: "", description: "", category: "CLOTHING", imageUrls: "" };

export default function ShowcasesTab() {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  function startEdit(s: Showcase) {
    setEditingId(s.id);
    setForm({
      title: s.title,
      description: s.description,
      category: s.category,
      imageUrls: s.images.join("\n")
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
      images: form.imageUrls.split("\n").map((s) => s.trim()).filter(Boolean),
      completedAt: new Date().toISOString()
    };
    const res = editingId
      ? await fetch(`/api/showcases/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/showcases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
    setStatus(
      res.ok
        ? editingId
          ? "Saved — the live Discord post was updated too."
          : "Posted — synced to the Discord portfolio channel."
        : "Something went wrong."
    );
    if (res.ok) {
      cancelEdit();
      loadShowcases();
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/showcases/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShowcases((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) cancelEdit();
    }
    setDeletingId(null);
  }

  return (
    <div>
      <h2 className="nyx-heading text-xl font-bold text-white">Showcases</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-nyx-muted">
            {editingId ? "Edit showcase" : "Upload new"}
          </h3>
          <p className="mt-1 text-xs text-nyx-muted">
            {editingId
              ? "Saving updates the live Discord post to match."
              : "Posting here also sends the preview to your Discord Portfolio channel automatically."}
          </p>
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
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              required
              rows={3}
              placeholder="Image URLs, one per line (already uploaded to storage)"
              value={form.imageUrls}
              onChange={(e) => setForm((f) => ({ ...f, imageUrls: e.target.value }))}
              className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-6 py-3 font-semibold text-white shadow-glow hover:opacity-90"
              >
                {editingId ? "Save changes" : "Post showcase"}
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
                  onClick={() => startEdit(s)}
                  className="rounded-full border border-nyx-line px-3 py-1.5 text-xs font-semibold text-white hover:border-nyx-pink"
                >
                  Edit
                </button>
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
