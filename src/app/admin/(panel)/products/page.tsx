import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { formatRwf } from "@/lib/format";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductListRow {
  id: string;
  name: string;
  slug: string;
  category_slug: CategorySlug;
  price_rwf: number;
  images: string[];
  featured: boolean;
  in_stock: boolean;
}

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("ou_products")
    .select("id, name, slug, category_slug, price_rwf, images, featured, in_stock")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as ProductListRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Products <span className="text-ink-faint">({products.length})</span>
        </h1>
        <Link
          href="/admin/products/new"
          className="cursor-pointer rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          + New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No products yet. Add your first one to get the shop live.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-cream/50"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink">{product.name}</span>
                    {product.featured && (
                      <span className="rounded-full bg-copper-tint px-2 py-0.5 text-[0.65rem] font-semibold text-copper-deep">
                        Featured
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-faint">
                    {product.category_slug}
                  </span>
                </span>
                <span className="hidden text-sm tabular-nums text-ink-soft sm:block">
                  {formatRwf(product.price_rwf)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    product.in_stock
                      ? "bg-sage/15 text-sage"
                      : "bg-ink/8 text-ink-faint"
                  }`}
                >
                  {product.in_stock ? "In stock" : "Out"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
