"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Store, Star, Phone } from "lucide-react";
import {
  InteractiveMenu,
  type InteractiveMenuItem,
} from "@/components/ui/modern-mobile-menu";

const ITEMS: InteractiveMenuItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Shop", icon: ShoppingBag, href: "/shop" },
  { label: "Business", icon: Store, href: "/business" },
  { label: "Reviews", icon: Star, href: "/testimonials" },
  { label: "Contact", icon: Phone, href: "/contact" },
];

function activeIndexForPath(pathname: string): number {
  // Longest prefix match, but keep Home exact.
  let best = 0;
  let bestLen = -1;
  ITEMS.forEach((item, index) => {
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

  // Hide on admin routes.
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="md:hidden" aria-hidden={false}>
      <InteractiveMenu
        items={ITEMS}
        accentColor="var(--color-copper)"
        activeIndex={activeIndexForPath(pathname)}
        onSelect={(_, item) => item.href && router.push(item.href)}
      />
    </div>
  );
}
