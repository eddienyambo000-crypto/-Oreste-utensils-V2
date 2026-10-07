import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  categoriesWithProducts,
  departments,
  filterProducts,
  homepageRail,
  parseShopQuery,
  shopQueryString,
} from "./catalog";
import type { Category, Product } from "./types";

function category(over: Partial<Category>): Category {
  return {
    id: over.slug ?? "c",
    name: "Cat",
    slug: "cat",
    description: "",
    intro: "",
    image: "",
    sortOrder: 10,
    ...over,
  };
}

let seq = 0;
function product(over: Partial<Product>): Product {
  seq += 1;
  return {
    id: `p${seq}`,
    name: "Item",
    slug: `item-${seq}`,
    categorySlug: "cookware",
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

describe("categoriesWithProducts", () => {
  it("drops empty categories and counts the rest, in display order", () => {
    const cats = [
      category({ slug: "kettle", sortOrder: 10 }), // empty, mistyped admin label
      category({ slug: "dinnerware", sortOrder: 2 }),
      category({ slug: "cookware", sortOrder: 1 }),
    ];
    const prods = [
      product({ categorySlug: "dinnerware" }),
      product({ categorySlug: "cookware" }),
      product({ categorySlug: "cookware" }),
    ];
    expect(
      categoriesWithProducts(cats, prods).map((e) => [e.category.slug, e.count]),
    ).toEqual([
      ["cookware", 2],
      ["dinnerware", 1],
    ]);
  });

  it("is empty when there are no products", () => {
    expect(categoriesWithProducts([category({ slug: "cookware" })], [])).toEqual([]);
  });
});

describe("departments", () => {
  it("keeps only categories with a cover photo, ordered and capped", () => {
    const cats = [
      category({ slug: "blenda", image: "" }),
      category({ slug: "b", image: "/b.webp", sortOrder: 2 }),
      category({ slug: "a", image: "/a.webp", sortOrder: 1 }),
      category({ slug: "c", image: "  " }),
    ];
    expect(departments(cats).map((c) => c.slug)).toEqual(["a", "b"]);
    expect(departments(cats, 1).map((c) => c.slug)).toEqual(["a"]);
  });
});

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

describe("parseShopQuery / shopQueryString", () => {
  it("reads valid params and round-trips them", () => {
    const query = parseShopQuery({ category: "cookware", q: "  wok ", sort: "price-asc" });
    expect(query).toEqual({ category: "cookware", q: "wok", sort: "price-asc" });
    expect(shopQueryString(query)).toBe("?category=cookware&q=wok&sort=price-asc");
  });

  it("falls back safely on malformed input", () => {
    const query = parseShopQuery({ category: "<script>", sort: "cheapest", q: undefined });
    expect(query).toEqual({ category: null, q: "", sort: "newest" });
    expect(shopQueryString(query)).toBe("");
  });

  it("takes the first value of repeated params and caps search length", () => {
    const query = parseShopQuery({ category: ["dinnerware", "x"], q: "a".repeat(200) });
    expect(query.category).toBe("dinnerware");
    expect(query.q).toHaveLength(80);
  });
});

describe("filterProducts", () => {
  const kettle = product({ name: "Classic Stovetop Kettle", categorySlug: "cookware", priceRwf: 42_000 });
  const teapot = product({ name: "Théière en céramique", categorySlug: "dinnerware", priceRwf: 15_000 });
  const wok = product({ name: "Stainless Wok", categorySlug: "cookware", priceRwf: 89_000 });
  const all = [kettle, teapot, wok];

  it("filters by category", () => {
    const result = filterProducts(all, { category: "cookware", q: "", sort: "newest" });
    expect(result.map((p) => p.id).sort()).toEqual([kettle.id, wok.id].sort());
  });

  it("requires every search word, ignoring case and accents", () => {
    expect(filterProducts(all, { category: null, q: "theiere ceramique", sort: "newest" })).toEqual([teapot]);
    expect(filterProducts(all, { category: null, q: "STOVETOP kettle", sort: "newest" })).toEqual([kettle]);
    expect(filterProducts(all, { category: null, q: "kettle wok", sort: "newest" })).toEqual([]);
  });

  it("sorts by price both ways", () => {
    const asc = filterProducts(all, { category: null, q: "", sort: "price-asc" });
    expect(asc.map((p) => p.priceRwf)).toEqual([15_000, 42_000, 89_000]);
    const desc = filterProducts(all, { category: null, q: "", sort: "price-desc" });
    expect(desc.map((p) => p.priceRwf)).toEqual([89_000, 42_000, 15_000]);
  });

  it("does not mutate the input", () => {
    const copy = [...all];
    filterProducts(all, { category: null, q: "", sort: "price-asc" });
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
