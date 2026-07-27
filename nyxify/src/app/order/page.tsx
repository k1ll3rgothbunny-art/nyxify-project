"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DiscordSignInButton from "@/components/DiscordSignInButton";

export const dynamic = "force-dynamic";

const SERVICES = ["CLOTHING", "CHAINS", "FACES", "TATTOOS", "OTHER"];

export default function OrderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState("CLOTHING");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="nyx-heading text-2xl font-bold text-white">Log in to start an order</h1>
        <p className="mt-2 text-sm text-nyx-muted">Orders are tied to your Discord account so I can open a ticket and keep you updated.</p>
        <div className="mt-8">
          <DiscordSignInButton label="Log in with Discord to continue" />
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("service", service);
      formData.append("notes", notes);
      if (files) {
        Array.from(files).forEach((f) => formData.append("references", f));
      }
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to submit order");
      const order = await res.json();
      router.push(`/dashboard?order=${order.id}`);
    } catch (err) {
      setError("Something went wrong submitting your order. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Start an order</h1>
      <p className="mt-2 text-sm text-nyx-muted">
        Tell me what you need. I'll open a Discord ticket and send a custom quote to your dashboard.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">Service</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {SERVICES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setService(s)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  service === s
                    ? "border-nyx-pink bg-nyx-pink/10 text-white"
                    : "border-nyx-line text-nyx-muted hover:border-nyx-pink/50"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-white">
            Notes &amp; references
          </label>
          <textarea
            id="notes"
            required
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you want. Link any inspiration images if you have them."
            className="w-full rounded-xl border border-nyx-line bg-nyx-panel px-4 py-3 text-white placeholder:text-nyx-muted/60 focus:border-nyx-pink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="files" className="mb-2 block text-sm font-medium text-white">
            Upload reference images/files
          </label>
          <input
            id="files"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="block w-full text-sm text-nyx-muted file:mr-4 file:rounded-full file:border-0 file:bg-nyx-pink/15 file:px-4 file:py-2 file:text-nyx-pink2 hover:file:bg-nyx-pink/25"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gradient-to-r from-nyx-pink to-nyx-violet px-6 py-3 font-semibold text-white shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit order request"}
        </button>
      </form>
    </div>
  );
}
