"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/app/admin/actions";
import { IconClose, IconPencil, IconTrash } from "@/components/ui/icons";
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

export function ProductRow({ product }: { product: ProductRowData }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editHref = `/admin/products/${product.id}`;

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteProduct(product.id);
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <Link
          href={editHref}
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream"
        >
          {product.image && (
            <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={editHref}
              className="truncate font-medium text-ink transition-colors duration-200 hover:text-copper"
            >
              {product.name}
            </Link>
            {product.featured && (
              <span className="shrink-0 rounded-full bg-copper-tint px-2 py-0.5 text-[0.65rem] font-semibold text-copper-deep">
                Featured
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-ink-faint">
            <span className="truncate">{product.categoryName}</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{formatRwf(product.priceRwf)}</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.inStock ? "bg-sage/15 text-sage" : "bg-ink/8 text-ink-faint"
          }`}
        >
          {product.inStock ? "In stock" : "Out"}
        </span>
      </div>

      {/* Inline actions — always visible, touch-friendly */}
      <div className="flex items-center justify-end gap-2 sm:shrink-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            {error ? (
              <span className="text-xs text-copper-deep">{error}</span>
            ) : (
              <span className="text-xs text-ink-soft">Delete?</span>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full bg-copper-deep px-3 text-sm font-medium text-white transition-transform duration-150 active:scale-95 disabled:opacity-60"
            >
              <IconTrash className="h-4 w-4" />
              {deleting ? "…" : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
              disabled={deleting}
              aria-label="Cancel delete"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors duration-150 hover:text-ink active:scale-95"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Link
              href={editHref}
              aria-label={`Edit ${product.name}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-copper hover:text-copper active:scale-95"
            >
              <IconPencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${product.name}`}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors duration-150 hover:border-copper-deep hover:text-copper-deep active:scale-95"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
