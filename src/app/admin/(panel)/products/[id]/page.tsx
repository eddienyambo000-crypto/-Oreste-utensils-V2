import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductEditor } from "../ProductEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product" };

interface ProductRow {
  id: string;
  name: string;
  slug: string;
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

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("ou_products").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();
  const row = data as ProductRow;

  const product: Product = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    priceRwf: row.price_rwf,
    shortDescription: row.short_description,
    description: row.description,
    specs: row.specs ?? {},
    images: row.images ?? [],
    featured: row.featured,
    inStock: row.in_stock,
    createdAt: row.created_at,
  };

  return <ProductEditor product={product} />;
}
