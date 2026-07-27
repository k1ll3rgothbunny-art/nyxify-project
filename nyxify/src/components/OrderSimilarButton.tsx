"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function OrderSimilarButton({ showcaseId, showcaseTitle }: { showcaseId: string; showcaseTitle: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);

  async function handleClick() {
    if (!session) {
      signIn("discord");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/discord/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNote: `I'd like something similar to this showcase: "${showcaseTitle}".`,
          showcaseId
        })
      });
      const data = await res.json();
      if (data?.channelUrl) setTicketUrl(data.channelUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-gradient-to-r from-nyx-pink to-nyx-violet px-8 py-3 text-lg font-semibold text-white shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Opening ticket…" : "Order Something Similar"}
      </button>
      {ticketUrl && (
        <p className="mt-3 text-sm text-nyx-muted">
          Ticket opened —{" "}
          <a href={ticketUrl} target="_blank" rel="noreferrer" className="text-nyx-pink2 hover:underline">
            jump into your Discord channel
          </a>.
        </p>
      )}
    </div>
  );
}
