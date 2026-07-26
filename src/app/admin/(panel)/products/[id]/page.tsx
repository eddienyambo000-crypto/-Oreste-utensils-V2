import { notFound } from "next/navigation";
import { ProductEditor } from "../ProductEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";
import type { CategorySlug, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category_slug: CategorySlug;
  price_rwf: number;
  short_description: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  featured: boolean;
  in_stock: boolean;
  created_at: string;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [{ data }, categories] = await Promise.all([
    supabase.from("ou_products").select("*").eq("id", id).maybeSingle(),
    getCategories(),
  ]);

  if (!data) notFound();
  const row = data as ProductRow;

  const product: Product = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categorySlug: row.category_slug,
    priceRwf: row.price_rwf,
    shortDescription: row.short_description,
    description: row.description,
    specs: row.specs ?? {},
    images: row.images ?? [],
    featured: row.featured,
    inStock: row.in_stock,
    createdAt: row.created_at,
  };

  return (
    <ProductEditor
      product={product}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
    />
  );
}
