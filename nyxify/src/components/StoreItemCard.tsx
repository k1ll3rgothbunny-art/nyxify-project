import Link from "next/link";
import { formatPriceRange } from "@/lib/format";

export default function StoreItemCard({
  id, title, category, image, priceMinCents, priceMaxCents
}: { id: string; title: string; category: string; image: string; priceMinCents: number; priceMaxCents: number | null }) {
  return (
    <Link href={`/store/${id}`} className="nyx-card group block overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-nyx-panel2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

        {/* Always-visible hint so it's clear the card opens a detail page, not just the buy button */}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View details
        </span>

        {/* On hover/tap-hold, a fuller overlay reinforces it */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="rounded-full border border-nyx-pink2/60 px-4 py-1.5 text-xs font-semibold text-white">
            View details & order →
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-nyx-pink2">{category}</p>
        <h3 className="mt-1 font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm font-bold text-white">{formatPriceRange(priceMinCents, priceMaxCents)}</p>
      </div>
    </Link>
  );
}
