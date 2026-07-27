import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrderSimilarButton from "@/components/OrderSimilarButton";

export const dynamic = "force-dynamic";

export default async function ShowcaseDetailPage({ params }: { params: { id: string } }) {
  const showcase = await prisma.showcase.findUnique({ where: { id: params.id } });
  if (!showcase) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-widest text-nyx-pink2">{showcase.category}</p>
      <h1 className="nyx-heading mt-2 text-3xl font-bold text-white">{showcase.title}</h1>
      <p className="mt-2 text-sm text-nyx-muted">Completed {showcase.completedAt.toDateString()}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showcase.images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img} alt={`${showcase.title} ${i + 1}`} className="w-full rounded-xl border border-nyx-line" />
        ))}
      </div>

      <p className="mt-8 text-nyx-muted">{showcase.description}</p>

      <div className="mt-10">
        <OrderSimilarButton showcaseId={showcase.id} showcaseTitle={showcase.title} />
      </div>
    </div>
  );
}
