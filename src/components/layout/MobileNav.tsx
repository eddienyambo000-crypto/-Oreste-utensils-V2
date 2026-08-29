"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Store, Star, Phone } from "lucide-react";
import {
  InteractiveMenu,
  type InteractiveMenuItem,
} from "@/components/ui/modern-mobile-menu";
import { useLang } from "@/lib/i18n/LanguageProvider";

function activeIndexForPath(
  items: InteractiveMenuItem[],
  pathname: string,
): number {
  // Longest prefix match, but keep Home exact.
  let best = 0;
  let bestLen = -1;
  items.forEach((item, index) => {
    if (!item.href) return;
    const match =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    if (match && item.href.length > bestLen) {
      best = index;
      bestLen = item.href.length;
    }
  });
  return best;
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useLang();

  // Hide on admin routes.
  if (pathname.startsWith("/admin")) return null;

  const items: InteractiveMenuItem[] = [
    { label: dict.nav.home, icon: Home, href: "/" },
    { label: dict.nav.shop, icon: ShoppingBag, href: "/shop" },
    { label: dict.nav.business, icon: Store, href: "/business" },
    { label: dict.nav.reviews, icon: Star, href: "/testimonials" },
    { label: dict.nav.contact, icon: Phone, href: "/contact" },
  ];

  return (
    <div className="md:hidden" aria-hidden={false}>
      <InteractiveMenu
        items={items}
        accentColor="var(--color-copper)"
        activeIndex={activeIndexForPath(items, pathname)}
        onSelect={(_, item) => item.href && router.push(item.href)}
      />
    </div>
  );
}
