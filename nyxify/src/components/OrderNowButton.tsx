"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { formatPriceRange } from "@/lib/format";

export default function OrderNowButton({
  itemId, title, description, priceMinCents, priceMaxCents, category, image
}: {
  itemId: string;
  title: string;
  description: string;
  priceMinCents: number;
  priceMaxCents: number | null;
  category: string;
  image: string;
}) {
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
          referenceNote:
            `Store order: "${title}" — ${formatPriceRange(priceMinCents, priceMaxCents)}\n\n${description}`,
          category,
          referenceImageUrl: image,
          showcaseId: itemId
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
        className="w-full rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Opening ticket…" : "Order Now"}
      </button>
      {ticketUrl && (
        <p className="mt-2 text-xs text-nyx-muted">
          Ticket opened —{" "}
          <a href={ticketUrl} target="_blank" rel="noreferrer" className="text-nyx-pink2 hover:underline">
            jump into your Discord channel
          </a>.
        </p>
      )}
    </div>
  );
}
