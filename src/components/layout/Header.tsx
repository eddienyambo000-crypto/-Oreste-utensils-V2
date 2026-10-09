"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { IconBag, IconClose, IconMenu } from "@/components/ui/icons";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Three tiers: phones get logo + menu (cart lives in the bottom tab bar),
 * tablets add the cart, desktops (lg+) get the full nav. The menu panel is
 * removed from the DOM when closed so its links are never tabbable while
 * hidden.
 */
export function Header({ logoUrl }: { logoUrl?: string | null }) {
  const { count, openCart } = useCart();
  const { dict, locale, setLocale } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/shop", label: dict.nav.shop },
    { href: "/business", label: dict.nav.business },
    { href: "/testimonials", label: dict.nav.reviews },
    { href: "/about", label: dict.nav.about },
    { href: "/faq", label: dict.nav.faq },
    { href: "/contact", label: dict.nav.contact },
  ];
  const isActive = (href: string) =>
    href === "/shop"
      ? pathname.startsWith("/shop") || pathname.startsWith("/product")
      : pathname.startsWith(href);

  // Close the menu on navigation and on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const cartLabel = `${dict.cart.open} (${count})`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-porcelain/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          {logoUrl && (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              priority
              sizes="40px"
              className="h-9 w-9 shrink-0 rounded-full object-contain sm:h-10 sm:w-10"
            />
          )}
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">Oreste</span>{" "}
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-copper">Utensils</span>
          </span>
        </Link>

        <nav aria-label={dict.nav.main} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href) ? "bg-cream text-ink" : "text-ink-soft hover:bg-cream/70 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={openCart}
            aria-label={cartLabel}
            className="relative hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-cream md:flex"
          >
            <IconBag className="h-5 w-5" />
            {count > 0 && (
              <span
                key={count}
                aria-hidden
                className="absolute right-0.5 top-0.5 flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-copper px-1 text-[0.65rem] font-bold tabular-nums text-on-copper"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-cream lg:hidden"
          >
            {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="site-menu" aria-label={dict.nav.main} className="border-t border-line bg-porcelain lg:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-xl px-3 text-base font-medium transition-colors duration-200 hover:bg-cream ${
                    isActive(link.href) ? "text-copper" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-6">
            <div role="group" aria-label={dict.language.label} className="flex rounded-full border border-line-strong p-1">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLocale(l);
                    setMenuOpen(false);
                  }}
                  aria-pressed={l === locale}
                  className={`min-h-9 cursor-pointer rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
                    l === locale ? "bg-ink text-porcelain" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
            <ThemeToggle withLabel />
          </div>
        </nav>
      )}
    </header>
  );
}
