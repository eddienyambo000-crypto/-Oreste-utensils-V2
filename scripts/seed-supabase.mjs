/**
 * Seeds the launch catalog straight into Supabase using the service-role key.
 * Idempotent (upsert on slug). Run once after applying the SQL migrations:
 *   node --experimental-strip-types scripts/seed-supabase.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 */
import { createClient } from "@supabase/supabase-js";
import { seedCategories, seedProducts } from "../src/lib/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const categories = seedCategories.map((c) => ({
  name: c.name,
  slug: c.slug,
  description: c.description,
  intro: c.intro,
  image: c.image,
  sort_order: c.sortOrder,
}));

const products = seedProducts.map((p) => ({
  name: p.name,
  slug: p.slug,
  category_slug: p.categorySlug,
  price_rwf: p.priceRwf,
  short_description: p.shortDescription,
  description: p.description,
  specs: p.specs,
  images: p.images,
  featured: p.featured,
  in_stock: p.inStock,
}));

const { error: catError } = await supabase
  .from("ou_categories")
  .upsert(categories, { onConflict: "slug" });
if (catError) {
  console.error("Categories failed:", catError.message);
  process.exit(1);
}

const { error: prodError } = await supabase
  .from("ou_products")
  .upsert(products, { onConflict: "slug" });
if (prodError) {
  console.error("Products failed:", prodError.message);
  process.exit(1);
}

console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
