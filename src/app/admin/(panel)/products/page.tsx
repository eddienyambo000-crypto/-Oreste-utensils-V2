import Link from "next/link";
import { ProductRow, type ProductRowData } from "./ProductRow";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";
import { IconPlus } from "@/components/ui/icons";
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

  const [{ data }, categories] = await Promise.all([
    supabase
      .from("ou_products")
      .select("id, name, slug, category_slug, price_rwf, images, featured, in_stock")
      .order("created_at", { ascending: false }),
    getCategories(),
  ]);

  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const products = (data ?? []) as ProductListRow[];
  const rows: ProductRowData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: nameBySlug.get(p.category_slug) ?? p.category_slug,
    priceRwf: p.price_rwf,
    image: p.images?.[0] ?? null,
    featured: p.featured,
    inStock: p.in_stock,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Products <span className="text-ink-faint">({rows.length})</span>
        </h1>
        <Link
          href="/admin/products/new"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          <IconPlus className="h-4 w-4" />
          New product
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No products yet. Add your first one to get the shop live.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
