import { describe, expect, it } from "vitest";
import {
  MAX_QTY,
  addToCart,
  cartCount,
  cartSubtotal,
  qualifiesForFreeDelivery,
  removeFromCart,
  setItemQuantity,
} from "./cart";
import type { CartItem, Product } from "./types";

function product(over: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Ember Dutch Oven",
    slug: "ember-dutch-oven",
    categorySlug: "cookware",
    priceRwf: 145_000,
    shortDescription: "",
    description: "",
    specs: {},
    images: ["/a.webp"],
    featured: false,
    inStock: true,
    createdAt: "2026-01-01",
    ...over,
  };
}

const line = (over: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  slug: "s",
  name: "n",
  priceRwf: 1000,
  image: "",
  quantity: 1,
  ...over,
});

describe("cartCount / cartSubtotal", () => {
  it("sums units and money across lines", () => {
    const items = [line({ priceRwf: 1000, quantity: 2 }), line({ productId: "p2", priceRwf: 500, quantity: 3 })];
    expect(cartCount(items)).toBe(5);
    expect(cartSubtotal(items)).toBe(1000 * 2 + 500 * 3);
  });
  it("is zero for an empty cart", () => {
    expect(cartCount([])).toBe(0);
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("addToCart", () => {
  it("adds a new line with the product's main image", () => {
    const next = addToCart([], product());
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ productId: "p1", quantity: 1, image: "/a.webp" });
  });
  it("merges quantity for an existing product instead of duplicating", () => {
    const next = addToCart([line({ quantity: 2 })], product(), 3);
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(5);
  });
  it("clamps a merged line to MAX_QTY", () => {
    const next = addToCart([line({ quantity: 98 })], product(), 10);
    expect(next[0].quantity).toBe(MAX_QTY);
  });
  it("does not mutate the input array", () => {
    const items = [line()];
    const snapshot = structuredClone(items);
    addToCart(items, product({ id: "p2" }));
    expect(items).toEqual(snapshot);
  });
  it("falls back to an empty image string when the product has none", () => {
    expect(addToCart([], product({ images: [] }))[0].image).toBe("");
  });
});

describe("setItemQuantity", () => {
  it("updates a line's quantity", () => {
    expect(setItemQuantity([line({ quantity: 1 })], "p1", 4)[0].quantity).toBe(4);
  });
  it("removes the line when quantity drops below 1", () => {
    expect(setItemQuantity([line()], "p1", 0)).toHaveLength(0);
  });
  it("clamps to MAX_QTY", () => {
    expect(setItemQuantity([line()], "p1", 9999)[0].quantity).toBe(MAX_QTY);
  });
});

describe("removeFromCart", () => {
  it("drops only the matching line", () => {
    const items = [line({ productId: "p1" }), line({ productId: "p2" })];
    expect(removeFromCart(items, "p1").map((i) => i.productId)).toEqual(["p2"]);
  });
});

describe("qualifiesForFreeDelivery", () => {
  it("is always free for pickup", () => {
    expect(qualifiesForFreeDelivery(0, 500_000, "pickup")).toBe(true);
  });
  it("is free for delivery at or above the threshold", () => {
    expect(qualifiesForFreeDelivery(500_000, 500_000, "delivery")).toBe(true);
    expect(qualifiesForFreeDelivery(499_999, 500_000, "delivery")).toBe(false);
  });
});
