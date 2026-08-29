import type { Metadata } from "next";
import { ShopExplorer } from "@/components/shop/ShopExplorer";
import { Reveal } from "@/components/ui/Reveal";
import { getCategories, getProducts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Shop Kitchenware in Kigali",
  description:
    "Browse the full Oreste Utensils catalog — cookware, dinnerware, cutlery, glassware, storage and small appliances. Delivery across Kigali, free over 500,000 RWF.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories, dict] = await Promise.all([
    getProducts(),
    getCategories(),
    getDictionary(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal>
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            {dict.shop.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            {dict.shop.title}
          </h1>
          <p className="mt-4 leading-relaxed text-ink-soft">{dict.shop.intro}</p>
        </header>
      </Reveal>

      <div className="mt-10">
        <ShopExplorer products={products} categories={categories} />
      </div>
    </div>
  );
}
