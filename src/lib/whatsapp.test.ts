import { describe, expect, it } from "vitest";
import { buildOrderMessage, productInquiryLink, whatsappLink } from "./whatsapp";
import type { CartItem } from "./types";

const items: CartItem[] = [
  { productId: "p1", slug: "s1", name: "Dutch Oven", priceRwf: 300_000, image: "", quantity: 1 },
  { productId: "p2", slug: "s2", name: "Wok", priceRwf: 120_000, image: "", quantity: 2 },
];

describe("whatsappLink", () => {
  it("targets the business number and URL-encodes the message", () => {
    const url = whatsappLink("hello world & co");
    expect(url.startsWith("https://wa.me/250783399163?text=")).toBe(true);
    expect(url).toContain("hello%20world%20%26%20co");
  });
});

describe("productInquiryLink", () => {
  it("embeds the product name", () => {
    expect(decodeURIComponent(productInquiryLink("Copper Kettle"))).toContain("Copper Kettle");
  });
});

describe("buildOrderMessage", () => {
  it("lists items, subtotal and marks FREE delivery over the threshold", () => {
    // 300,000 + 2×120,000 = 540,000 ≥ 500,000
    const msg = buildOrderMessage({
      items,
      customerName: "Oreste",
      phone: "+250783399163",
      fulfillment: "delivery",
      deliveryArea: "Kacyiru",
      note: null,
    });
    expect(msg).toContain("Dutch Oven × 1");
    expect(msg).toContain("Wok × 2");
    expect(msg).toContain("Subtotal: 540,000 RWF");
    expect(msg).toContain("Delivery: FREE");
    expect(msg).toContain("Delivery area: Kacyiru");
    expect(msg).toContain("Name: Oreste");
  });

  it("asks to confirm the fee when the order is below the threshold", () => {
    const msg = buildOrderMessage({
      items: [items[1]], // 240,000 < 500,000
      customerName: "A",
      phone: "x",
      fulfillment: "delivery",
      deliveryArea: "Remera",
      note: "call first",
    });
    expect(msg).toContain("Delivery: fee to confirm based on location");
    expect(msg).toContain("Note: call first");
  });

  it("uses the free pickup line for pickup", () => {
    const msg = buildOrderMessage({
      items,
      customerName: "A",
      phone: "x",
      fulfillment: "pickup",
      deliveryArea: null,
      note: null,
    });
    expect(msg).toContain("Pickup at City Plaza (free)");
    expect(msg).not.toContain("Delivery area:");
  });
});
