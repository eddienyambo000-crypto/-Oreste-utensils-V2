import { describe, expect, it } from "vitest";
import { storagePathsIn } from "./storage";

const base = "https://abc.supabase.co/storage/v1/object/public";

describe("storagePathsIn", () => {
  it("maps public URLs in the bucket to object paths", () => {
    expect(
      storagePathsIn(
        [`${base}/product-images/products/a.webp`, `${base}/product-images/products/b%20c.webp?v=2`],
        "product-images",
      ),
    ).toEqual(["products/a.webp", "products/b c.webp"]);
  });

  it("ignores bundled images, other buckets and path tricks", () => {
    expect(
      storagePathsIn(
        [
          "/images/kitchen-default.webp",
          `${base}/other-bucket/x.webp`,
          `${base}/product-images/../secret.webp`,
          `http://abc.supabase.co/storage/v1/object/public/product-images/insecure.webp`,
        ],
        "product-images",
      ),
    ).toEqual([]);
  });
});
