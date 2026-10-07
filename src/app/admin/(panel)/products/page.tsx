import type { Metadata } from "next";
import Link from "next/link";
import { ProductList } from "./ProductList";
import type { ProductRowData } from "./ProductRow";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";
import { IconCamera, IconPlus } from "@/components/ui/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

interface ProductListRow {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  price_rwf: number;
  images: string[] | null;
  featured: boolean;
  in_stock: boolean;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [{ data, error }, categories, { saved }] = await Promise.all([
    supabase
      .from("ou_products")
      .select("id, name, slug, category_slug, price_rwf, images, featured, in_stock")
      .order("created_at", { ascending: false }),
    getCategories(),
    searchParams,
  ]);

  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const rows: ProductRowData[] = ((data ?? []) as ProductListRow[]).map((p) => ({
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
          Products <span className="font-normal text-ink-faint">({rows.length})</span>
        </h1>
        <Link
          href="/admin/products/new"
          className="hidden min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-copper px-5 text-sm font-semibold text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98] md:inline-flex"
        >
          <IconPlus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      {saved && (
        <p role="status" className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-ink">
          Saved “{saved.slice(0, 120)}”. It&apos;s live in the shop.
        </p>
      )}

      {error ? (
        <p role="alert" className="rounded-2xl border border-copper/30 bg-copper-tint/40 p-6 text-sm text-copper-deep">
          Couldn&apos;t load products: {error.message}. Refresh to try again.
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <IconCamera className="mx-auto h-8 w-8 text-copper" />
          <h2 className="mt-3 font-display text-xl font-semibold">Add your first product</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">
            Take a photo, type the name and price, save. It shows in the shop straight away.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-6 font-semibold text-white shadow-copper transition-colors duration-200 hover:bg-copper-deep"
          >
            <IconPlus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      ) : (
        <ProductList initial={rows} />
      )}
    </div>
  );
}
