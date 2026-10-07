"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { setProductFlags } from "@/app/admin/actions";
import { IconStar } from "@/components/ui/icons";
import { formatRwf } from "@/lib/format";

export interface ProductRowData {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  priceRwf: number;
  image: string | null;
  featured: boolean;
  inStock: boolean;
}

/**
 * One product in the admin list. Stock and "show on homepage" flip with one
 * tap (optimistic, rolled back if the save fails) so the shop can be kept
 * current from a phone without opening the editor.
 */
export function ProductRow({
  product,
  onChange,
}: {
  product: ProductRowData;
  onChange: (next: ProductRowData) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editHref = `/admin/products/${product.id}`;

  async function flip(flag: "featured" | "inStock") {
    const next = { ...product, [flag]: !product[flag] };
    setPending(true);
    setError(null);
    onChange(next);
    const result = await setProductFlags({ id: product.id, [flag]: next[flag] });
    setPending(false);
    if (!result.ok) {
      onChange(product);
      setError("Couldn't save — check your connection and try again.");
    }
  }

  return (
    <li className="px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href={editHref}
          tabIndex={-1}
          aria-hidden
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream"
        >
          {product.image ? (
            <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-center text-[0.6rem] font-medium uppercase leading-tight tracking-wide text-ink-faint">
              No photo
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={editHref}
            className="line-clamp-2 text-[0.9375rem] font-medium leading-snug text-ink transition-colors duration-200 hover:text-copper sm:text-base"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-ink-faint">
            <span className="shrink-0 font-medium tabular-nums text-ink-soft">{formatRwf(product.priceRwf)}</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="hidden truncate sm:inline">{product.categoryName}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => flip("featured")}
          disabled={pending}
          aria-pressed={product.featured}
          aria-label={`Show ${product.name} on the homepage`}
          title={product.featured ? "On the homepage" : "Not on the homepage"}
          className={`-mx-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-copper active:scale-90 disabled:cursor-wait ${
            product.featured ? "text-copper hover:bg-copper-tint/50" : "text-ink-faint hover:bg-cream hover:text-ink"
          }`}
        >
          <IconStar className="h-5 w-5" fill={product.featured ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={() => flip("inStock")}
          disabled={pending}
          aria-pressed={product.inStock}
          aria-label={`${product.name} in stock`}
          className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold sm:w-[6rem] sm:px-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-copper active:scale-95 disabled:cursor-wait ${
            product.inStock
              ? "border-sage/40 bg-sage/10 text-sage hover:bg-sage/15"
              : "border-line-strong text-ink-faint hover:text-ink"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${product.inStock ? "bg-sage" : "bg-ink-faint"}`}
          />
          {product.inStock ? "In stock" : "Sold out"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 pl-[4.25rem] text-xs font-medium text-copper-deep">
          {error}
        </p>
      )}
    </li>
  );
}
