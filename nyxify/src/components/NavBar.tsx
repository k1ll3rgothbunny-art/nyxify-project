import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/reviews", label: "Reviews" },
  { href: "/order", label: "Start an Order" },
  { href: "/dashboard", label: "My Dashboard" }
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-nyx-line/60 bg-nyx-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="nyx-heading text-xl font-bold nyx-gradient-text">
          NYXIFY
        </Link>
        <nav className="hidden gap-8 text-sm text-nyx-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-nyx-pink2 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/your-invite"
            className="hidden rounded-full border border-nyx-line px-4 py-2 text-sm text-nyx-muted hover:border-nyx-pink hover:text-white transition-colors sm:inline-block"
          >
            Join Discord
          </a>
          <Link
            href="/order"
            className="rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-5 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-opacity"
          >
            Start an Order
          </Link>
        </div>
      </div>
    </header>
  );
}
