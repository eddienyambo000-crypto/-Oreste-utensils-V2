"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Category, Product } from "@/lib/types";

type SortKey = "newest" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

interface ShopExplorerProps {
  products: Product[];
  categories: Category[];
}

export function ShopExplorer({ products, categories }: ShopExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.name])),
    [categories],
  );

  const visible = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.priceRwf - b.priceRwf;
        case "price-desc":
          return b.priceRwf - a.priceRwf;
        default:
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
    });
  }, [products, activeCategory, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category pills */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 lg:min-w-0 lg:flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filter by category"
        >
          {[{ slug: "all", name: "All" }, ...categories].map((category) => {
            const active = activeCategory === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                aria-pressed={active}
                className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 active:scale-[0.97] ${
                  active
                    ? "border-ink bg-ink text-porcelain"
                    : "border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <label className="relative">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-line-strong bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-faint sm:w-56"
            />
          </label>
          <label>
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="cursor-pointer rounded-full border border-line-strong bg-surface px-4 py-2 text-sm text-ink"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-faint" aria-live="polite">
        {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <p className="font-medium text-ink">Nothing matches that search.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Try a different word, or clear the filters — or ask us on WhatsApp,
            we may have it in store.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryNames.get(product.categorySlug)}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
