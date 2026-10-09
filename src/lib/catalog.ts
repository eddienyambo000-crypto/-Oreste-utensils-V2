import { SITE_URL } from "./constants";
import type { Product } from "./types";

/**
 * Pure catalog rules shared by the storefront pages. Kept free of React and
 * data fetching so each rule is unit-tested in isolation (catalog.test.ts).
 *
 * The catalogue is one list: the owner adds a photo, a name and a price, and
 * shoppers find things by searching and sorting. There are no categories to
 * maintain.
 */

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

/**
 * "More from the shop" on a product page: other products with a photo —
 * in stock first, then starred, then newest. Never the product itself.
 */
export function relatedProducts(products: Product[], current: Product, limit = 4): Product[] {
  return products
    .filter((product) => product.id !== current.id && product.images[0])
    .sort(
      (a, b) =>
        Number(b.inStock) - Number(a.inStock) ||
        Number(b.featured) - Number(a.featured) ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )
    .slice(0, limit);
}

export type SortKey = "newest" | "price-asc" | "price-desc";
export const SORT_KEYS: readonly SortKey[] = ["newest", "price-asc", "price-desc"];

export interface ShopQuery {
  q: string;
  sort: SortKey;
}

/** Reads shop filters from URL search params, ignoring anything malformed. */
export function parseShopQuery(
  params: Record<string, string | string[] | undefined>,
): ShopQuery {
  const one = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const sort = one(params.sort);
  return {
    q: one(params.q).slice(0, 80),
    sort: (SORT_KEYS as readonly string[]).includes(sort) ? (sort as SortKey) : "newest",
  };
}

/** Serialises a shop query back to a search string, omitting defaults. */
export function shopQueryString(query: ShopQuery): string {
  const params = new URLSearchParams();
  if (query.q.trim()) params.set("q", query.q.trim());
  if (query.sort !== "newest") params.set("sort", query.sort);
  const value = params.toString();
  return value ? `?${value}` : "";
}

/** Normalises text for search: lowercase, accents stripped, collapsed spaces. */
export function normaliseSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Applies search (every word must match) and sort. Pure. */
export function filterProducts(products: Product[], query: ShopQuery): Product[] {
  let list = products;
  const terms = normaliseSearch(query.q).split(" ").filter(Boolean);
  if (terms.length > 0) {
    list = list.filter((product) => {
      const haystack = normaliseSearch(`${product.name} ${product.shortDescription}`);
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
