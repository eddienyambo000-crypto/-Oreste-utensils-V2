import { unstable_cache } from "next/cache";
import { cache } from "react";
import { z } from "zod";
import {
  FREE_DELIVERY_THRESHOLD_RWF,
  SITE_IMAGE_KEYS,
  type SiteImageKey,
} from "./constants";
import { seedProducts } from "./seed";
import { getPublicClient, isSupabaseConfigured } from "./supabase/public";
import type { Product } from "./types";

/**
 * Parse, don't trust: validate Supabase rows at the boundary with Zod and drop
 * anything malformed, so a bad/renamed column fails loudly in dev and degrades
 * gracefully in prod instead of surfacing as a cryptic error three components
 * deep.
 */
function validRows<S extends z.ZodType>(schema: S, data: unknown): z.infer<S>[] {
  if (!Array.isArray(data)) return [];
  const rows: z.infer<S>[] = [];
  for (const row of data) {
    const parsed = schema.safeParse(row);
    if (parsed.success) rows.push(parsed.data);
    else if (process.env.NODE_ENV !== "production") {
      console.warn("[data] dropped malformed row:", parsed.error.issues[0]?.message);
    }
  }
  return rows;
}

/**
 * Cache tag for the shared catalog. The site reads the locale cookie for i18n,
 * which makes routes dynamically rendered — so the catalog queries are cached
 * across requests here (revalidated on a timer OR immediately when the admin
 * edits products/testimonials via updateTag(CATALOG_TAG)).
 * Admin-editable *settings* (logo, site photos, threshold) are left
 * uncached so their edits go live instantly.
 */
export const CATALOG_TAG = "catalog";
const CATALOG_REVALIDATE = 300;

/**
 * The bundled seed catalog powers local development, CI builds and demos. It
 * is never served by the production deployment: if the database is missing
 * there, catalog reads throw (and the pages show an honest "catalog
 * unavailable" state) instead of quietly displaying invented products.
 */
function servesSeedCatalog(): boolean {
  if (isSupabaseConfigured) return false;
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Catalog database is not configured for production.");
  }
  return true;
}

/**
 * Catalog data access. Reads from Supabase when configured, otherwise from
 * the typed seed catalog — so the site runs end-to-end without any keys.
 */

const productRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price_rwf: z.coerce.number(),
  short_description: z.string().nullish().transform((v) => v ?? ""),
  description: z.string().nullish().transform((v) => v ?? ""),
  specs: z.record(z.string(), z.string()).nullish().transform((v) => v ?? {}),
  images: z.array(z.string()).nullish().transform((v) => v ?? []),
  featured: z.boolean().nullish().transform((v) => v ?? false),
  in_stock: z.boolean().nullish().transform((v) => v ?? true),
  created_at: z.string(),
});
type ProductRow = z.infer<typeof productRowSchema>;

function mapProduct(row: ProductRow): Product {
  return {
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
}

/** Every product, newest first. Filtering and sorting happen in lib/catalog. */
export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    if (servesSeedCatalog()) return [...seedProducts];
    const { data, error } = await getPublicClient()
      .from("ou_products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to load products: ${error.message}`);
    return validRows(productRowSchema, data).map(mapProduct);
  },
  ["products"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE },
);

/**
 * One product, read fresh (stock and price must be current on its own page).
 * Wrapped in React cache() so generateMetadata and the page share one query.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (servesSeedCatalog()) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  const { data, error } = await getPublicClient()
    .from("ou_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  const parsed = productRowSchema.safeParse(data);
  return parsed.success ? mapProduct(parsed.data) : null;
});

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

/** Uploaded logo URL, or null to fall back to the text wordmark. */
export async function getLogoUrl(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await getPublicClient()
    .from("ou_settings")
    .select("value")
    .eq("key", "logo_url")
    .maybeSingle();
  const value = data?.value?.trim();
  return value ? value : null;
}

const testimonialRowSchema = z.object({
  id: z.string(),
  client_name: z.string(),
  business: z.string().nullish().transform((v) => v ?? null),
  quote: z.string(),
  photo: z.string().nullish().transform((v) => v ?? null),
  rating: z.coerce.number().nullish().transform((v) => v ?? 5),
  sort_order: z.coerce.number().nullish().transform((v) => v ?? 0),
  created_at: z.string(),
});

export const getTestimonials = unstable_cache(
  async (): Promise<import("./types").Testimonial[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await getPublicClient()
      .from("ou_testimonials")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    // Table may not exist yet (migration pending) — fail soft.
    if (error) return [];
    return validRows(testimonialRowSchema, data).map((row) => ({
      id: row.id,
      clientName: row.client_name,
      business: row.business,
      quote: row.quote,
      photo: row.photo,
      rating: row.rating,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    }));
  },
  ["testimonials"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE },
);

export type SiteImages = Record<SiteImageKey, string>;

/**
 * Editable site photos. An uploaded photo wins; an unset slot falls back to
 * the next real upload (about → shop section → main photo) before any bundled
 * default, so a single real shop photo replaces every stock image.
 */
export async function getSiteImages(): Promise<SiteImages> {
  const set: Partial<Record<SiteImageKey, string>> = {};
  if (isSupabaseConfigured) {
    const { data } = await getPublicClient()
      .from("ou_settings")
      .select("key, value")
      .in("key", Object.keys(SITE_IMAGE_KEYS));
    for (const row of (data as { key: string; value: string }[] | null) ?? []) {
      const value = row.value?.trim();
      if (value && row.key in SITE_IMAGE_KEYS) set[row.key as SiteImageKey] = value;
    }
  }
  return {
    hero_image: set.hero_image ?? SITE_IMAGE_KEYS.hero_image,
    story_image_1: set.story_image_1 ?? set.hero_image ?? SITE_IMAGE_KEYS.story_image_1,
    about_image:
      set.about_image ?? set.story_image_1 ?? set.hero_image ?? SITE_IMAGE_KEYS.about_image,
  };
}

/** Looker Studio dashboard embed URL for the admin Analytics page, if set. */
export async function getAnalyticsEmbedUrl(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await getPublicClient()
    .from("ou_settings")
    .select("value")
    .eq("key", "analytics_embed_url")
    .maybeSingle();
  const value = data?.value?.trim();
  return value ? value : null;
}
