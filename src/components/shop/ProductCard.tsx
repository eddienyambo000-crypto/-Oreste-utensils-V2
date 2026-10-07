"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRwf } from "@/lib/format";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Set on above-the-fold cards to prioritise their images. */
  priority?: boolean;
  /** Image `sizes` hint; defaults suit a 2/3/4-column grid. */
  sizes?: string;
}

/**
 * A product tile: photo, name, price, availability. Deliberately nothing else —
 * descriptions belong on the product page, and badges must reflect real data
 * (availability), never marketing claims.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: ProductCardProps) {
  const { dict } = useLang();
  const image = product.images[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-2xl focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-4 text-center font-display text-sm text-ink-faint">
            {product.name}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/95 px-2.5 py-1 text-[0.7rem] font-semibold text-ink shadow-sm">
            {dict.common.outOfStockBadge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <h3 className="line-clamp-2 text-[0.95rem] font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-copper">
          {product.name}
        </h3>
        <p className="mt-1.5 font-display text-[1.05rem] font-semibold tabular-nums text-ink">
          {formatRwf(product.priceRwf)}
        </p>
        <p
          className={`mt-1 flex items-center gap-1.5 text-xs ${
            product.inStock ? "text-sage" : "text-ink-faint"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-sage" : "bg-ink-faint"}`}
          />
          {product.inStock ? dict.product.available : dict.product.askAvailability}
        </p>
      </div>
    </Link>
  );
}
