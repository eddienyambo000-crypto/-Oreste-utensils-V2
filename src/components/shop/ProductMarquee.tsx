import Image from "next/image";
import Link from "next/link";
import { formatRwf } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Auto-scrolling strip of latest products. Renders nothing until there are
 * products with photos, so it never shows empty boxes. Pauses on hover; the
 * list is duplicated for a seamless CSS loop.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.images[0]).slice(0, 12);
  if (items.length < 3) return null;

  const loop = [...items, ...items];

  return (
    <div className="marquee-viewport w-full py-1" aria-label="Latest products">
      <div className="marquee-track gap-3 sm:gap-4">
        {loop.map((product, index) => (
          <Link
            key={`${product.id}-${index}`}
            href={`/product/${product.slug}`}
            aria-hidden={index >= items.length}
            tabIndex={index >= items.length ? -1 : undefined}
            className="group relative block h-32 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream shadow-card sm:h-36 sm:w-32"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="128px"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2">
              <p className="truncate text-[0.7rem] font-medium leading-tight text-white">
                {product.name}
              </p>
              <p className="text-[0.7rem] font-semibold text-copper-tint">
                {formatRwf(product.priceRwf)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
