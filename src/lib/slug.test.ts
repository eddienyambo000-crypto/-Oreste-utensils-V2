import { describe, expect, it } from "vitest";
import { slugOrFallback, slugify, summarize } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words with single dashes", () => {
    expect(slugify("  Electric Kettle 1.8 L  ")).toBe("electric-kettle-1-8-l");
  });

  it("folds accents instead of dropping letters", () => {
    expect(slugify("Poêle à frire — 28 cm")).toBe("poele-a-frire-28-cm");
  });

  it("never starts or ends with a dash, even when truncated", () => {
    expect(slugify("--Dinner set--")).toBe("dinner-set");
    expect(slugify("abc def", 4)).toBe("abc");
  });
});

describe("summarize", () => {
  it("keeps short text and collapses whitespace", () => {
    expect(summarize("  A  kettle.\n\nBoils fast. ", 300)).toBe("A kettle. Boils fast.");
  });

  it("cuts long text on a word boundary within the limit", () => {
    const out = summarize("Stainless steel pressure cooker with two handles", 20);
    expect(out).toBe("Stainless steel…");
    expect(out.length).toBeLessThanOrEqual(20);
  });
});

describe("slugOrFallback", () => {
  it("uses the fallback when the name has no usable characters", () => {
    expect(slugOrFallback("★★★", "product-1a2b")).toBe("product-1a2b");
    expect(slugOrFallback("Wok", "x")).toBe("wok");
  });
});
