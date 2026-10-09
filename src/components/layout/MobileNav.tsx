"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { IconBag, IconGrid, IconHome, IconWhatsApp } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Phone-only tab bar in the thumb zone: Home, Shop, Cart and WhatsApp (the
 * shop's main ordering channel). Real links, so prefetching, long-press and
 * screen readers all behave as navigation should.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const { dict } = useLang();

  if (pathname.startsWith("/admin")) return null;

  const shopActive = pathname.startsWith("/shop") || pathname.startsWith("/product");
  const item =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors duration-200";
  const tone = (active: boolean) => (active ? "text-copper" : "text-ink-soft hover:text-ink");

  return (
    <nav
      aria-label={dict.nav.tabs}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-porcelain/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="flex">
        <li className="flex flex-1">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`${item} ${tone(pathname === "/")}`}>
            <IconHome aria-hidden className="h-5 w-5" />
            {dict.nav.home}
          </Link>
        </li>
        <li className="flex flex-1">
          <Link href="/shop" aria-current={shopActive ? "page" : undefined} className={`${item} ${tone(shopActive)}`}>
            <IconGrid aria-hidden className="h-5 w-5" />
            {dict.nav.shop}
          </Link>
        </li>
        <li className="flex flex-1">
          <button type="button" onClick={openCart} className={`${item} ${tone(false)} cursor-pointer`}>
            <span className="relative">
              <IconBag aria-hidden className="h-5 w-5" />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 animate-bump items-center justify-center rounded-full bg-copper px-1 text-[0.6rem] font-bold tabular-nums text-on-copper"
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
            <span>
              {dict.cart.title}
              <span className="sr-only"> ({count})</span>
            </span>
          </button>
        </li>
        <li className="flex flex-1">
          <a
            href={whatsappLink("Hello Oreste Utensils! I have a question about your kitchenware.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${item} ${tone(false)}`}
          >
            <IconWhatsApp aria-hidden className="h-5 w-5 text-whatsapp" />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
