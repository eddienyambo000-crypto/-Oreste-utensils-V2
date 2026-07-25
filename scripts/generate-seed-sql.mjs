/**
 * Generates supabase/migrations/0002_seed_catalog.sql from the canonical seed
 * data so the SQL and the in-app fallback never drift.
 *   node --experimental-strip-types scripts/generate-seed-sql.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { seedCategories, seedProducts } from "../src/lib/seed.ts";

const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
const arr = (values) => `array[${values.map(q).join(", ")}]::text[]`;
const jsonb = (obj) => `${q(JSON.stringify(obj))}::jsonb`;

const lines = [
  "-- Oreste Utensils — launch catalog seed.",
  "-- Generated from src/lib/seed.ts by scripts/generate-seed-sql.mjs — do not edit by hand.",
  "-- Run after 0001_init.sql.",
  "",
  "insert into public.ou_categories (name, slug, description, intro, image, sort_order) values",
  seedCategories
    .map(
      (c) =>
        `  (${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${q(c.intro)}, ${q(c.image)}, ${c.sortOrder})`,
    )
    .join(",\n") + "\non conflict (slug) do nothing;",
  "",
  "insert into public.ou_products (name, slug, category_slug, price_rwf, short_description, description, specs, images, featured, in_stock) values",
  seedProducts
    .map(
      (p) =>
        `  (${q(p.name)}, ${q(p.slug)}, ${q(p.categorySlug)}, ${p.priceRwf}, ${q(p.shortDescription)}, ${q(p.description)}, ${jsonb(p.specs)}, ${arr(p.images)}, ${p.featured}, ${p.inStock})`,
    )
    .join(",\n") + "\non conflict (slug) do nothing;",
  "",
];

const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "migrations",
  "0002_seed_catalog.sql",
);
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath}`);
