"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cards", label: "Cards" },
  { href: "/decks", label: "Decks" },
  { href: "/decks/new", label: "Build" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-cyber-black/90 backdrop-blur-sm border-b border-cyber-yellow/30">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-lg font-bold text-cyber-yellow tracking-widest"
        >
          CYBERPUNK TCG
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm font-mono uppercase tracking-wider transition-colors rounded",
                pathname === link.href
                  ? "text-cyber-yellow"
                  : "text-cyber-light/60 hover:text-cyber-light"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
