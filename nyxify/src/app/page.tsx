import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ServiceCard from "@/components/ServiceCard";
import ShowcaseCard from "@/components/ShowcaseCard";
import ReviewStars from "@/components/ReviewStars";

// Without this, Next.js treats this page as static — built once at deploy
// time — since nothing on it looks "dynamic" to it by default. That meant
// new showcases/reviews posted after deploy never showed up here even
// though they were saved correctly. This makes it check the database fresh
// on every visit instead.
export const dynamic = "force-dynamic";

const SERVICES = [
  { title: "Clothing", description: "Custom outfits and textures built to spec for your character." },
  { title: "Chains", description: "Custom 3D jewelry pieces, from subtle to statement." },
  { title: "Faces", description: "Custom face presets and detailing." },
  { title: "Tattoos", description: "Original tattoo designs and overlays." },
  { title: "Other FiveM Assets", description: "Anything else your server or character needs." }
];

const FAQ = [
  { q: "How does ordering work?", a: "Start an order, tell me what you need, and I'll send a custom quote through your dashboard and Discord ticket." },
  { q: "How do I pay?", a: "Card, PayPal, or Cash App — all through the site once your quote is ready. Deposits are supported on larger orders." },
  { q: "Where do my files go?", a: "Every completed order lands in your personal Vault, available to re-download any time." },
  { q: "Do I need a separate account?", a: "No — just log in with Discord and you're set." }
];

export default async function HomePage() {
  const [showcases, reviews] = await Promise.all([
    prisma.showcase.findMany({ orderBy: { completedAt: "desc" }, take: 4 }).catch(() => []),
    prisma.review.findMany({ where: { featured: true }, include: { customer: true }, take: 3 }).catch(() => [])
  ]);

  return (
    <div>
      {/* Banner */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/banner.jpg"
          alt="Nyxify — Built Different, Made to Stand Out"
          className="w-full rounded-2xl border border-nyx-line shadow-glow"
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-12 pb-20 text-center">
        <p className="mb-4 inline-block rounded-full border border-nyx-line px-4 py-1 text-xs uppercase tracking-widest text-nyx-pink2">
          Custom FiveM Assets
        </p>
        <h1 className="nyx-heading mx-auto max-w-3xl text-5xl font-bold leading-tight text-white sm:text-6xl">
          Custom work, <span className="nyx-gradient-text">delivered clean.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-nyx-muted">
          Clothing, chains, faces, tattoos, and more — ordered, paid, and tracked in one place,
          fully connected to your Discord.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/order"
            className="rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-8 py-3 font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
          >
            Start an Order
          </Link>
          <a
            href="https://discord.gg/your-invite"
            className="rounded-full border border-nyx-line px-8 py-3 font-semibold text-nyx-muted hover:border-nyx-pink hover:text-white transition-colors"
          >
            Join Discord
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="nyx-heading text-2xl font-bold text-white">What I make</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((s) => (
            <ServiceCard key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="nyx-heading text-2xl font-bold text-white">Recent work</h2>
          <Link href="/portfolio" className="text-sm text-nyx-pink2 hover:underline">View all</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {showcases.length > 0 ? (
            showcases.map((s) => (
              <ShowcaseCard key={s.id} id={s.id} title={s.title} category={s.category} image={s.images[0] ?? ""} />
            ))
          ) : (
            <p className="col-span-full text-sm text-nyx-muted">Showcases will appear here once uploaded in the admin dashboard.</p>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="nyx-heading text-2xl font-bold text-white">What customers say</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="nyx-card p-6">
                <ReviewStars rating={r.rating} />
                <p className="mt-3 text-sm text-nyx-muted">&ldquo;{r.body}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-white">— {r.customer.username}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-sm text-nyx-muted">Featured reviews will show up here once customers leave them.</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="nyx-heading text-2xl font-bold text-white text-center">FAQ</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map((f) => (
            <details key={f.q} className="nyx-card group p-5">
              <summary className="cursor-pointer list-none font-semibold text-white">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-nyx-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
