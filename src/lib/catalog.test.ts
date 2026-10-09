import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  filterProducts,
  homepageRail,
  parseShopQuery,
  relatedProducts,
  shopQueryString,
} from "./catalog";
import type { Product } from "./types";

let seq = 0;
function product(over: Partial<Product>): Product {
  seq += 1;
  return {
    id: `p${seq}`,
    name: "Item",
    slug: `item-${seq}`,
    priceRwf: 10_000,
    shortDescription: "",
    description: "",
    specs: {},
    images: ["/a.webp"],
    featured: false,
    inStock: true,
    createdAt: `2026-01-${String(seq).padStart(2, "0")}T00:00:00Z`,
    ...over,
  };
}

describe("homepageRail", () => {
  it("shows featured products first, in-stock before sold-out", () => {
    const soldOut = product({ featured: true, inStock: false });
    const inStock = product({ featured: true });
    const others = [product({}), product({}), product({})];
    const rail = homepageRail([soldOut, inStock, ...others], 12, 1);
    expect(rail[0].id).toBe(inStock.id);
    expect(rail[1].id).toBe(soldOut.id);
  });

  it("tops up with the newest products when too few are featured", () => {
    const featured = product({ featured: true, createdAt: "2026-01-01T00:00:00Z" });
    const older = product({ createdAt: "2026-02-01T00:00:00Z" });
    const newer = product({ createdAt: "2026-03-01T00:00:00Z" });
    const rail = homepageRail([featured, older, newer], 12, 4);
    expect(rail.map((p) => p.id)).toEqual([featured.id, newer.id, older.id]);
  });

  it("never includes a product without a photo, and caps the length", () => {
    const noPhoto = product({ images: [], featured: true });
    const many = Array.from({ length: 20 }, () => product({}));
    const rail = homepageRail([noPhoto, ...many], 6);
    expect(rail).toHaveLength(6);
    expect(rail.some((p) => p.id === noPhoto.id)).toBe(false);
  });

  it("does not duplicate a featured product in the top-up", () => {
    const f = product({ featured: true });
    const rail = homepageRail([f], 12, 4);
    expect(rail.filter((p) => p.id === f.id)).toHaveLength(1);
  });
});

describe("relatedProducts", () => {
  it("never suggests the product itself or one without a photo", () => {
    const current = product({});
    const noPhoto = product({ images: [] });
    const other = product({});
    expect(relatedProducts([current, noPhoto, other], current).map((p) => p.id)).toEqual([other.id]);
  });

  it("puts in-stock first, then starred, then newest, and caps the list", () => {
    const current = product({});
    const soldOut = product({ inStock: false, featured: true, createdAt: "2026-05-01T00:00:00Z" });
    const starred = product({ featured: true, createdAt: "2026-02-01T00:00:00Z" });
    const newest = product({ createdAt: "2026-04-01T00:00:00Z" });
    const oldest = product({ createdAt: "2026-01-15T00:00:00Z" });
    const list = relatedProducts([current, soldOut, starred, newest, oldest], current, 3);
    expect(list.map((p) => p.id)).toEqual([starred.id, newest.id, oldest.id]);
  });
});

describe("parseShopQuery / shopQueryString", () => {
  it("reads valid params and round-trips them", () => {
    const query = parseShopQuery({ q: "  wok ", sort: "price-asc" });
    expect(query).toEqual({ q: "wok", sort: "price-asc" });
    expect(shopQueryString(query)).toBe("?q=wok&sort=price-asc");
  });

  it("falls back safely on malformed input and ignores old category links", () => {
    const query = parseShopQuery({ category: "cookware", sort: "cheapest", q: undefined });
    expect(query).toEqual({ q: "", sort: "newest" });
    expect(shopQueryString(query)).toBe("");
  });

  it("takes the first value of repeated params and caps search length", () => {
    const query = parseShopQuery({ q: ["a".repeat(200), "x"], sort: ["price-desc", "newest"] });
    expect(query.q).toHaveLength(80);
    expect(query.sort).toBe("price-desc");
  });
});

describe("filterProducts", () => {
  const kettle = product({ name: "Classic Stovetop Kettle", priceRwf: 42_000 });
  const teapot = product({ name: "Théière en céramique", priceRwf: 15_000 });
  const wok = product({ name: "Stainless Wok", shortDescription: "Carbon steel, 32 cm", priceRwf: 89_000 });
  const all = [kettle, teapot, wok];

  it("requires every search word, ignoring case and accents", () => {
    expect(filterProducts(all, { q: "theiere ceramique", sort: "newest" })).toEqual([teapot]);
    expect(filterProducts(all, { q: "STOVETOP kettle", sort: "newest" })).toEqual([kettle]);
    expect(filterProducts(all, { q: "kettle wok", sort: "newest" })).toEqual([]);
  });

  it("also searches the description", () => {
    expect(filterProducts(all, { q: "carbon 32", sort: "newest" })).toEqual([wok]);
  });

  it("sorts by price both ways", () => {
    const asc = filterProducts(all, { q: "", sort: "price-asc" });
    expect(asc.map((p) => p.priceRwf)).toEqual([15_000, 42_000, 89_000]);
    const desc = filterProducts(all, { q: "", sort: "price-desc" });
    expect(desc.map((p) => p.priceRwf)).toEqual([89_000, 42_000, 15_000]);
  });

  it("does not mutate the input", () => {
    const copy = [...all];
    filterProducts(all, { q: "", sort: "price-asc" });
    expect(all).toEqual(copy);
  });
});

describe("absoluteUrl", () => {
  it("leaves storage URLs alone and prefixes site paths", () => {
    const storage = "https://x.supabase.co/storage/v1/object/public/a.webp";
    expect(absoluteUrl(storage)).toBe(storage);
    expect(absoluteUrl("/products/a.webp")).toMatch(/^https?:\/\/[^/]+\/products\/a\.webp$/);
  });
});
