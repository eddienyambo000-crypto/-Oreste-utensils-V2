import Image from "next/image";
import Link from "next/link";
import { formatRwf } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  /** Set on above-the-fold cards to prioritise their images. */
  priority?: boolean;
}

export function ProductCard({ product, categoryName, priority = false }: ProductCardProps) {
  return (
    <article className="group relative flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col rounded-2xl bg-surface shadow-card transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-cream">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          {!product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-porcelain backdrop-blur-sm">
              Out of stock
            </span>
          )}
          {product.featured && product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-copper px-3 py-1 text-xs font-medium text-white">
              Bestseller
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          {categoryName && (
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {categoryName}
            </p>
          )}
          <h3 className="font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-copper">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>
          <p className="mt-2 font-display text-lg font-semibold tabular-nums text-ink">
            {formatRwf(product.priceRwf)}
          </p>
        </div>
      </Link>
    </article>
  );
}
