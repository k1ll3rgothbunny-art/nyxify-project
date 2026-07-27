"use client";
import { useState } from "react";

const CATEGORIES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

export default function AdminShowcasesPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CLOTHING");
  const [imageUrls, setImageUrls] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Upload a showcase</h1>
      <p className="mt-2 text-sm text-nyx-muted">
        Posting here also sends the preview to your Discord Portfolio channel automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input
          required
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white"
        />
        <textarea
          required
          rows={4}
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
          className="w-full rounded-full bg-gradient-to-r from-nyx-pink to-nyx-violet px-6 py-3 font-semibold text-white shadow-glow hover:opacity-90"
        >
          Post showcase
        </button>
        {status && <p className="text-sm text-nyx-muted">{status}</p>}
      </form>
    </div>
  );
}
