import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { IconArrowRight } from "@/components/ui/icons";
import type { Product } from "@/lib/types";

interface ProductRailProps {
  id: string;
  title: string;
  actionLabel: string;
  actionHref: string;
  products: Product[];
}

/**
 * A row of real products. On phones it is a swipeable, snap-aligned rail the
 * visitor controls (no auto-scrolling — moving content without a pause control
 * fails WCAG 2.2.2, and hover-to-pause does not exist on touch screens). From
 * the `md` breakpoint up it becomes an ordinary grid.
 */
export function ProductRail({ id, title, actionLabel, actionHref, products }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={id} className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id={id} className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            {title}
          </h2>
          <Link
            href={actionHref}
            className="inline-flex shrink-0 items-center gap-1.5 py-2 text-sm font-semibold text-copper transition-colors duration-200 hover:text-copper-deep"
          >
            {actionLabel}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <ul
        role="list"
        className="scroll-rail mt-6 flex scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 md:mx-auto md:grid md:max-w-7xl md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-4 lg:px-8"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[44vw] max-w-[13rem] shrink-0 snap-start md:w-auto md:max-w-none">
            {/* Lazy: the rail sits below the hero, whose photo is the LCP. */}
            <ProductCard
              product={product}
              sizes="(max-width: 768px) 44vw, (max-width: 1024px) 33vw, 300px"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
