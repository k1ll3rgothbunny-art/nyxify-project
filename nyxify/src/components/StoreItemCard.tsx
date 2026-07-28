import Link from "next/link";
import { formatPriceRange } from "@/lib/format";

export default function StoreItemCard({
  id, title, category, image, priceMinCents, priceMaxCents
}: { id: string; title: string; category: string; image: string; priceMinCents: number; priceMaxCents: number | null }) {
  return (
    <Link href={`/store/${id}`} className="nyx-card group block overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-nyx-panel2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-nyx-pink2">{category}</p>
        <h3 className="mt-1 font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm font-bold text-white">{formatPriceRange(priceMinCents, priceMaxCents)}</p>
      </div>
    </Link>
  );
}
