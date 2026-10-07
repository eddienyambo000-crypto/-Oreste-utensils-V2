import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { categoriesWithProducts } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/business`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [categories, products] = await Promise.all([getCategories(), getProducts()]);

    // Only categories with products: empty ones are noindexed, so listing
    // them here would send crawlers to pages that ask not to be indexed.
    const categoryRoutes: MetadataRoute.Sitemap = categoriesWithProducts(categories, products).map(
      ({ category }) => ({
        url: `${SITE_URL}/shop/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    // Catalogue unavailable: still serve the pages that don't depend on it.
    return staticRoutes;
  }
}
