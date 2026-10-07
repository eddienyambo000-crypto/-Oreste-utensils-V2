import { describe, expect, it } from "vitest";
import { formatOrderTime, orderReference, whatsappDigits } from "./orders";

describe("orderReference", () => {
  it("takes the first six hex digits of the order id, upper-cased", () => {
    expect(orderReference("1a2b3c4d-0000-0000-0000-000000000000")).toBe("OU-1A2B3C");
  });
});

describe("whatsappDigits", () => {
  it("normalises the ways Rwandan numbers are typed", () => {
    expect(whatsappDigits("0788 123 456")).toBe("250788123456");
    expect(whatsappDigits("+250 788-123-456")).toBe("250788123456");
    expect(whatsappDigits("788123456")).toBe("250788123456");
    expect(whatsappDigits("00250788123456")).toBe("250788123456");
  });

  it("keeps other international numbers and rejects junk", () => {
    expect(whatsappDigits("+256 772 123456")).toBe("256772123456");
    expect(whatsappDigits("12345")).toBeNull();
    expect(whatsappDigits("")).toBeNull();
  });
});

describe("formatOrderTime", () => {
  it("formats in Kigali time regardless of the machine's timezone", () => {
    // 22:30 UTC is 00:30 the next day in Kigali (UTC+2).
    expect(formatOrderTime("2026-10-06T22:30:00Z")).toBe("7 Oct, 00:30");
  });
});
