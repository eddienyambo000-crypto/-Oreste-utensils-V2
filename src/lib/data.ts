import { FREE_DELIVERY_THRESHOLD_RWF } from "./constants";
import { seedCategories, seedProducts } from "./seed";
import { getPublicClient, isSupabaseConfigured } from "./supabase/public";
import type { Category, CategorySlug, Product } from "./types";

/**
 * Catalog data access. Reads from Supabase when configured, otherwise from
 * the typed seed catalog — so the site runs end-to-end without any keys.
 */

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

interface CategoryRow {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  intro: string;
  image: string;
  sort_order: number;
}

function mapProduct(row: ProductRow): Product {
  return {
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
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    intro: row.intro,
    image: row.image,
    sortOrder: row.sort_order,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    return [...seedCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { data, error } = await getPublicClient()
    .from("ou_categories")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(filter?: {
  categorySlug?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  let products: Product[];

  if (!isSupabaseConfigured) {
    products = [...seedProducts];
  } else {
    let query = getPublicClient()
      .from("ou_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter?.categorySlug) {
      query = query.eq("category_slug", filter.categorySlug);
    }
    if (filter?.featuredOnly) {
      query = query.eq("featured", true);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Failed to load products: ${error.message}`);
    return (data as ProductRow[]).map(mapProduct);
  }

  if (filter?.categorySlug) {
    products = products.filter((p) => p.categorySlug === filter.categorySlug);
  }
  if (filter?.featuredOnly) {
    products = products.filter((p) => p.featured);
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await getPublicClient()
    .from("ou_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const inCategory = await getProducts({ categorySlug: product.categorySlug });
  const related = inCategory.filter((p) => p.id !== product.id);
  if (related.length >= limit) return related.slice(0, limit);

  // Pad with featured products from other categories.
  const featured = await getProducts({ featuredOnly: true });
  const pad = featured.filter(
    (p) => p.id !== product.id && !related.some((r) => r.id === p.id),
  );
  return [...related, ...pad].slice(0, limit);
}

/** Free-delivery threshold in RWF — admin-editable when Supabase is live. */
export async function getFreeDeliveryThreshold(): Promise<number> {
  if (!isSupabaseConfigured) return FREE_DELIVERY_THRESHOLD_RWF;
  const { data } = await getPublicClient()
    .from("ou_settings")
    .select("value")
    .eq("key", "free_delivery_threshold_rwf")
    .maybeSingle();
  const parsed = Number(data?.value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : FREE_DELIVERY_THRESHOLD_RWF;
}
