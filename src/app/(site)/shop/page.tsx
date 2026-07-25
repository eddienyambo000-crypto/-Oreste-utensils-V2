import type { Metadata } from "next";
import { ShopExplorer } from "@/components/shop/ShopExplorer";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop Kitchenware in Kigali",
  description:
    "Browse the full Oreste Utensils catalog — cookware, dinnerware, cutlery, glassware, storage and small appliances. Delivery across Kigali, free over 500,000 RWF.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
          The full collection
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
          Shop kitchenware
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Every piece we stock at City Plaza, Kigali — from forged knives to
          countertop appliances. Order online, pay cash or MoMo when it arrives.
        </p>
      </header>

      <div className="mt-10">
        <ShopExplorer products={products} categories={categories} />
      </div>
    </div>
  );
}
