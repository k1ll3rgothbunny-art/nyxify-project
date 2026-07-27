import { prisma } from "@/lib/prisma";
import ShowcaseCard from "@/components/ShowcaseCard";

export default async function PortfolioPage() {
  const showcases = await prisma.showcase.findMany({ orderBy: { completedAt: "desc" } }).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Portfolio</h1>
      <p className="mt-2 text-sm text-nyx-muted">Completed work, straight from real orders.</p>
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {showcases.map((s) => (
          <ShowcaseCard key={s.id} id={s.id} title={s.title} category={s.category} image={s.images[0] ?? ""} />
        ))}
        {showcases.length === 0 && <p className="col-span-full text-sm text-nyx-muted">No showcases uploaded yet.</p>}
      </div>
    </div>
  );
}
