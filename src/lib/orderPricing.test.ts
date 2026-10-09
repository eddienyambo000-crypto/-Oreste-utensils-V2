import { describe, expect, it } from "vitest";
import { priceOrder, type PricedProduct } from "./orderPricing";

const kettle: PricedProduct = {
  id: "k",
  slug: "kettle",
  name: "Electric kettle",
  priceRwf: 25_000,
  inStock: true,
  image: "/k.webp",
};
const wok: PricedProduct = { ...kettle, id: "w", slug: "wok", name: "Wok", priceRwf: 89_000 };
const catalogue = new Map([kettle, wok].map((p) => [p.id, p]));

describe("priceOrder", () => {
  it("uses catalogue names and prices, never the client's", () => {
    const result = priceOrder([{ productId: "k", name: "Kettle (edited)", quantity: 2 }], catalogue);
    expect(result).toEqual({
      ok: true,
      subtotal: 50_000,
      items: [{ productId: "k", slug: "kettle", name: "Electric kettle", priceRwf: 25_000, image: "/k.webp", quantity: 2 }],
    });
  });

  it("merges repeated lines for the same product", () => {
    const result = priceOrder(
      [
        { productId: "w", name: "Wok", quantity: 1 },
        { productId: "w", name: "Wok", quantity: 2 },
      ],
      catalogue,
    );
    expect(result.ok && result.items).toHaveLength(1);
    expect(result.ok && result.subtotal).toBe(267_000);
  });

  it("names unknown and sold-out products instead of pricing them", () => {
    const soldOut = new Map(catalogue).set("w", { ...wok, inStock: false });
    const result = priceOrder(
      [
        { productId: "gone", name: "Old teapot", quantity: 1 },
        { productId: "w", name: "Wok", quantity: 1 },
        { productId: "k", name: "Electric kettle", quantity: 1 },
      ],
      soldOut,
    );
    expect(result).toEqual({ ok: false, unavailable: ["Old teapot", "Wok"] });
  });
});
