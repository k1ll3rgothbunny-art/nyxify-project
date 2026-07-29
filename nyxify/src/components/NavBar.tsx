"use client";
import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/store", label: "Store" },
  { href: "/reviews", label: "Reviews" },
  { href: "/order", label: "Start an Order" },
  { href: "/dashboard", label: "My Dashboard" }
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

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
            href="https://discord.gg/F7wXr4tMdR"
            className="hidden rounded-full border border-nyx-line px-4 py-2 text-sm text-nyx-muted hover:border-nyx-pink hover:text-white transition-colors sm:inline-block"
          >
            Join Discord
          </a>
          <Link
            href="/order"
            className="hidden rounded-full bg-gradient-to-r from-nyx-pink to-nyx-pink2 px-5 py-2 text-sm font-semibold text-white shadow-glow hover:opacity-90 transition-opacity md:inline-block"
          >
            Start an Order
          </Link>

          {/* Mobile menu button — only shown below the md breakpoint, where the nav links above are hidden */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-nyx-line text-white md:hidden"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-nyx-line/60 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-white hover:bg-nyx-panel"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://discord.gg/F7wXr4tMdR"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-nyx-muted hover:bg-nyx-panel"
            >
              Join Discord
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
