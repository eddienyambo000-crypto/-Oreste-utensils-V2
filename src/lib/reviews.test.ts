import { describe, expect, it } from "vitest";
import { GOOGLE_REVIEW_FALLBACK, isGoogleReviewUrl, reviewDestination } from "./reviews";

describe("isGoogleReviewUrl", () => {
  it("accepts the links Google Business Profile hands out", () => {
    expect(isGoogleReviewUrl("https://g.page/r/CQx1y2z3/review")).toBe(true);
    expect(isGoogleReviewUrl("https://search.google.com/local/writereview?placeid=ChIJabc")).toBe(true);
    expect(isGoogleReviewUrl("https://maps.app.goo.gl/AbCdEf")).toBe(true);
  });

  it("rejects other hosts, http and junk", () => {
    expect(isGoogleReviewUrl("https://g.page.evil.com/r/x")).toBe(false);
    expect(isGoogleReviewUrl("http://g.page/r/x/review")).toBe(false);
    expect(isGoogleReviewUrl("javascript:alert(1)")).toBe(false);
    expect(isGoogleReviewUrl("not a url")).toBe(false);
  });
});

describe("reviewDestination", () => {
  it("uses a valid saved link and falls back to Maps otherwise", () => {
    expect(reviewDestination(" https://g.page/r/X/review ")).toBe("https://g.page/r/X/review");
    expect(reviewDestination("https://example.com")).toBe(GOOGLE_REVIEW_FALLBACK);
    expect(reviewDestination(null)).toBe(GOOGLE_REVIEW_FALLBACK);
  });
});
