import { SITE_URL } from "./constants";
import type { Category, Product } from "./types";

/**
 * Pure catalog rules shared by the storefront pages. Kept free of React and
 * data fetching so each rule is unit-tested in isolation (catalog.test.ts).
 */

export interface CategoryWithCount {
  category: Category;
  count: number;
}

/**
 * Categories that actually contain products, with counts, in display order.
 * Public filters and cross-links use this so an empty or mistyped category
 * created in the admin never surfaces as a dead-end chip on the live site.
 */
export function categoriesWithProducts(
  categories: Category[],
  products: Product[],
): CategoryWithCount[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.categorySlug, (counts.get(product.categorySlug) ?? 0) + 1);
  }
  return categories
    .map((category) => ({ category, count: counts.get(category.slug) ?? 0 }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => a.category.sortOrder - b.category.sortOrder);
}

/**
 * The curated departments shown as the homepage "shop by" grid: categories
 * the shop has given a cover photo, in display order. A category without a
 * photo is a working label, not a department.
 */
export function departments(categories: Category[], limit = 6): Category[] {
  return categories
    .filter((category) => category.image.trim() !== "")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit);
}

/**
 * Products for the homepage rail. The admin decides what slides by marking
 * products "Featured"; if fewer than `min` are featured, the newest products
 * with a photo top it up. Every tile is a real product, so its name, price,
 * photo, stock and link always match the shop.
 */
export function homepageRail(products: Product[], max = 12, min = 4): Product[] {
  const withPhoto = products.filter((product) => product.images[0]);
  const featured = withPhoto.filter((product) => product.featured);
  // In-stock pieces lead; sold-out ones can still show, labelled as such.
  featured.sort((a, b) => Number(b.inStock) - Number(a.inStock));
  if (featured.length >= min) return featured.slice(0, max);

  const chosen = new Set(featured.map((product) => product.id));
  const newest = [...withPhoto]
    .filter((product) => !chosen.has(product.id))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return [...featured, ...newest].slice(0, max);
}

export type SortKey = "newest" | "price-asc" | "price-desc";
export const SORT_KEYS: readonly SortKey[] = ["newest", "price-asc", "price-desc"];

export interface ShopQuery {
  category: string | null;
  q: string;
  sort: SortKey;
}

/** Reads shop filters from URL search params, ignoring anything malformed. */
export function parseShopQuery(
  params: Record<string, string | string[] | undefined>,
): ShopQuery {
  const one = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const category = one(params.category);
  const sort = one(params.sort);
  return {
    category: /^[a-z0-9-]{1,160}$/.test(category) ? category : null,
    q: one(params.q).slice(0, 80),
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : "newest",
  };
}

/** Serialises a shop query back to a search string, omitting defaults. */
export function shopQueryString(query: ShopQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.sort !== "newest") params.set("sort", query.sort);
  const value = params.toString();
  return value ? `?${value}` : "";
}

/** Normalises text for search: lowercase, accents stripped, collapsed spaces. */
function normalise(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Applies category, search (every word must match) and sort. Pure. */
export function filterProducts(products: Product[], query: ShopQuery): Product[] {
  let list = products;
  if (query.category) {
    list = list.filter((product) => product.categorySlug === query.category);
  }
  const terms = normalise(query.q).split(" ").filter(Boolean);
  if (terms.length > 0) {
    list = list.filter((product) => {
      const haystack = normalise(`${product.name} ${product.shortDescription}`);
      return terms.every((term) => haystack.includes(term));
    });
  }
  return [...list].sort((a, b) => {
    switch (query.sort) {
      case "price-asc":
        return a.priceRwf - b.priceRwf;
      case "price-desc":
        return b.priceRwf - a.priceRwf;
      default:
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
  });
}

/**
 * Makes a URL absolute for structured data and social cards. Storage images
 * are already absolute (https://…supabase.co/…); only bundled /paths need the
 * site origin.
 */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
