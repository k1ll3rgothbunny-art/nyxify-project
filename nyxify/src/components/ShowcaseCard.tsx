import Link from "next/link";

export default function ShowcaseCard({
  id, title, category, image
}: { id: string; title: string; category: string; image: string }) {
  return (
    <Link href={`/portfolio/${id}`} className="nyx-card group block overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-nyx-panel2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-nyx-pink2">{category}</p>
        <h3 className="mt-1 font-semibold text-white">{title}</h3>
      </div>
    </Link>
  );
}
