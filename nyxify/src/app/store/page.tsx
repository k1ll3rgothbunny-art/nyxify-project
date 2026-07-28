import { prisma } from "@/lib/prisma";
import StoreItemCard from "@/components/StoreItemCard";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const items = await prisma.storeItem.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Store</h1>
      <p className="mt-2 text-sm text-nyx-muted">Ready-made pieces — click one to see details and order.</p>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <StoreItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            category={item.category}
            image={item.image}
            priceMinCents={item.priceMinCents}
            priceMaxCents={item.priceMaxCents}
          />
        ))}
        {items.length === 0 && <p className="col-span-full text-sm text-nyx-muted">Nothing in the store yet.</p>}
      </div>
    </div>
  );
}
