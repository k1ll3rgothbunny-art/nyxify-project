import { prisma } from "@/lib/prisma";
import ReviewStars from "@/components/ReviewStars";

// Same reasoning as the homepage/portfolio pages — check the database fresh
// on every visit instead of a build-time cached copy, so new reviews show
// up immediately.
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { customer: true, order: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="nyx-heading text-3xl font-bold text-white">Reviews</h1>
      <p className="mt-2 text-sm text-nyx-muted">What customers have said about completed orders.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="nyx-card p-6">
            <ReviewStars rating={r.rating} />
            <p className="mt-3 text-sm text-nyx-muted">&ldquo;{r.body}&rdquo;</p>
            <p className="mt-4 text-sm font-semibold text-white">
              — {r.customer.username} · <span className="text-nyx-pink2">{r.order.service}</span>
            </p>
          </div>
        ))}
        {reviews.length === 0 && <p className="col-span-full text-sm text-nyx-muted">No reviews yet.</p>}
      </div>
    </div>
  );
}
