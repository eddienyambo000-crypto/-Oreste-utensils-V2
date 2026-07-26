"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { IconBag, IconClose, IconMenu } from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/business", label: "For Business" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Visit us" },
] as const;

export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-porcelain/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Oreste Utensils — home"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Oreste Utensils"
              width={160}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
          ) : (
            <>
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                Oreste
              </span>
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-copper sm:inline">
                Utensils
              </span>
            </>
          )}
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/shop"
                  ? pathname.startsWith("/shop") || pathname.startsWith("/product")
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "bg-cream text-ink"
                        : "text-ink-soft hover:bg-cream/70 hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative cursor-pointer rounded-full p-2.5 text-ink transition-colors duration-200 hover:bg-cream active:scale-95"
          >
            <IconBag className="h-5 w-5" />
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1 text-[0.65rem] font-bold tabular-nums text-white"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="cursor-pointer rounded-full p-2.5 text-ink transition-colors duration-200 hover:bg-cream active:scale-95 md:hidden"
          >
            {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        className={`overflow-hidden border-line bg-porcelain transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          menuOpen ? "max-h-72 border-t opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-base font-medium text-ink transition-colors duration-200 hover:bg-cream"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
