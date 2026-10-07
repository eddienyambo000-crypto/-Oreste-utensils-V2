import type { Metadata } from "next";
import { CatalogNotice } from "@/components/shop/CatalogNotice";
import { ShopExplorer } from "@/components/shop/ShopExplorer";
import { categoriesWithProducts, parseShopQuery } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Shop Kitchenware in Kigali",
  description:
    "Browse Oreste Utensils — cookware, dinnerware, glassware and small kitchen appliances from our shop at City Plaza, Kigali. Delivery across Kigali, free over 500,000 RWF. Pay cash or MoMo on delivery.",
  alternates: { canonical: "/shop" },
};

async function loadCatalog() {
  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    return { ok: true as const, products, categories };
  } catch (error) {
    console.error("[shop] catalogue failed to load:", error);
    return { ok: false as const };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [catalog, dict, params] = await Promise.all([
    loadCatalog(),
    getDictionary(),
    searchParams,
  ]);
  const t = dict.shop;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{t.intro}</p>
      </header>

      <div className="mt-8">
        {!catalog.ok ? (
          <CatalogNotice kind="unavailable" retryHref="/shop" dict={dict} />
        ) : catalog.products.length === 0 ? (
          <CatalogNotice kind="empty" dict={dict} />
        ) : (
          <ShopExplorer
            products={catalog.products}
            categories={categoriesWithProducts(catalog.categories, catalog.products).map(
              ({ category, count }) => ({ slug: category.slug, name: category.name, count }),
            )}
            initialQuery={parseShopQuery(params)}
          />
        )}
      </div>
    </div>
  );
}
