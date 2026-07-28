import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceRange } from "@/lib/format";
import OrderNowButton from "@/components/OrderNowButton";

export const dynamic = "force-dynamic";

export default async function StoreItemDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.storeItem.findUnique({ where: { id: params.id } });
  if (!item || !item.active) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-nyx-pink2">{item.category}</p>
      <h1 className="nyx-heading mt-2 text-3xl font-bold text-white">{item.title}</h1>
      <p className="mt-2 text-2xl font-bold text-white">{formatPriceRange(item.priceMinCents, item.priceMaxCents)}</p>

      <div className="mt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title} className="w-full rounded-xl border border-nyx-line" />
      </div>

      <p className="mt-8 text-nyx-muted">{item.description}</p>

      <div className="mt-10 max-w-xs">
        <OrderNowButton
          itemId={item.id}
          title={item.title}
          priceMinCents={item.priceMinCents}
          priceMaxCents={item.priceMaxCents}
          category={item.category}
          image={item.image}
        />
      </div>
    </div>
  );
}
