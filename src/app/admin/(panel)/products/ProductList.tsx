"use client";

import { useMemo, useState } from "react";
import { ProductRow, type ProductRowData } from "./ProductRow";
import { IconClose, IconSearch } from "@/components/ui/icons";

type Filter = "all" | "sold-out" | "homepage" | "no-photo";

const FILTERS: { key: Filter; label: string; test: (p: ProductRowData) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "sold-out", label: "Sold out", test: (p) => !p.inStock },
  { key: "homepage", label: "On homepage", test: (p) => p.featured },
  { key: "no-photo", label: "No photo", test: (p) => !p.image },
];

function normalise(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function ProductList({ initial }: { initial: ProductRowData[] }) {
  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const words = normalise(query).split(/\s+/).filter(Boolean);
    const test = FILTERS.find((f) => f.key === filter)?.test ?? (() => true);
    return products.filter((p) => {
      if (!test(p)) return false;
      const haystack = normalise(`${p.name} ${p.categoryName}`);
      return words.every((word) => haystack.includes(word));
    });
  }, [products, query, filter]);

  function update(next: ProductRowData) {
    setProducts((current) => current.map((p) => (p.id === next.id ? next : p)));
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or category"
          className="min-h-12 w-full rounded-full border border-line-strong bg-surface pl-12 pr-12 text-base text-ink placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors duration-150 hover:bg-cream hover:text-ink"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div role="group" aria-label="Filter products" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = products.filter(f.test).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                active ? "bg-ink text-porcelain" : "border border-line-strong text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${active ? "text-porcelain/70" : "text-ink-faint"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center text-ink-soft">
          No products match{query ? ` “${query}”` : " this filter"}.
        </p>
      ) : (
        <ul role="list" className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {visible.map((product) => (
            <ProductRow key={product.id} product={product} onChange={update} />
          ))}
        </ul>
      )}
      <p className="text-xs text-ink-faint">
        Tap <span className="font-medium text-ink-soft">★</span> to show a product on the homepage, and the stock
        badge to mark it sold out or back in stock. Changes go live immediately.
      </p>
    </div>
  );
}
