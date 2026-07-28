import { prisma } from "@/lib/prisma";
import OrderNowButton from "@/components/OrderNowButton";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const items = await prisma.storeItem.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Store</h1>
      <p className="mt-2 text-sm text-nyx-muted">Ready-made pieces — order one straight from here.</p>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="nyx-card overflow-hidden">
            <div className="aspect-square w-full overflow-hidden bg-nyx-panel2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-nyx-pink2">{item.category}</p>
              <h3 className="mt-1 font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-nyx-muted">{item.description}</p>
              <p className="mt-2 text-lg font-bold text-white">${(item.priceCents / 100).toFixed(2)}</p>
              <div className="mt-3">
                <OrderNowButton
                  itemId={item.id}
                  title={item.title}
                  priceCents={item.priceCents}
                  category={item.category}
                  image={item.image}
                />
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-sm text-nyx-muted">Nothing in the store yet.</p>}
      </div>
    </div>
  );
}
