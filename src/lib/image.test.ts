import { describe, expect, it } from "vitest";
import { compressImage } from "./image";

/**
 * compressImage relies on browser canvas APIs. In this Node test environment
 * those are absent, so we're verifying the fail-safe contract: it must always
 * hand back a usable File rather than throw — the guarantee the upload paths
 * depend on.
 */
describe("compressImage (fail-safe contract)", () => {
  it("returns the original file when browser APIs are unavailable", async () => {
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    await expect(compressImage(file)).resolves.toBe(file);
  });

  it("never re-encodes an SVG", async () => {
    const svg = new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" });
    await expect(compressImage(svg)).resolves.toBe(svg);
  });

  it("leaves non-image files untouched", async () => {
    const pdf = new File(["%PDF"], "spec.pdf", { type: "application/pdf" });
    await expect(compressImage(pdf)).resolves.toBe(pdf);
  });
});
