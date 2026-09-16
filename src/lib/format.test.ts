import { describe, expect, it } from "vitest";
import { formatPhone, formatRwf } from "./format";

describe("formatRwf", () => {
  it("groups thousands and appends the currency", () => {
    expect(formatRwf(450_000)).toBe("450,000 RWF");
    expect(formatRwf(1_500)).toBe("1,500 RWF");
    expect(formatRwf(0)).toBe("0 RWF");
  });
  it("does not show decimals", () => {
    expect(formatRwf(1999.6)).toBe("2,000 RWF");
  });
});

describe("formatPhone", () => {
  it("spaces a Rwandan number into readable groups", () => {
    expect(formatPhone("+250783399163")).toBe("+250 783 399 163");
  });
});
