"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import { IconClose, IconSearch, IconWhatsApp } from "@/components/ui/icons";
import {
  SORT_KEYS,
  filterProducts,
  shopQueryString,
  type ShopQuery,
  type SortKey,
} from "@/lib/catalog";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { Product } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

export interface ShopCategoryOption {
  slug: string;
  name: string;
  count: number;
}

interface ShopExplorerProps {
  products: Product[];
  categories: ShopCategoryOption[];
  initialQuery: ShopQuery;
}

/**
 * Search, category filter and sort over the full catalogue. Filtering is
 * instant (client-side) and mirrored into the URL with replaceState, so a
 * refreshed, shared or back-navigated page keeps the same view.
 */
export function ShopExplorer({ products, categories, initialQuery }: ShopExplorerProps) {
  const { dict } = useLang();
  const t = dict.shop;
  const [query, setQuery] = useState<ShopQuery>(() => ({
    ...initialQuery,
    // Drop a ?category= that no longer has products instead of showing nothing.
    category: categories.some((c) => c.slug === initialQuery.category)
      ? initialQuery.category
      : null,
  }));

  function update(patch: Partial<ShopQuery>) {
    setQuery((prev) => {
      const next = { ...prev, ...patch };
      window.history.replaceState(null, "", `${window.location.pathname}${shopQueryString(next)}`);
      return next;
    });
  }

  const visible = useMemo(() => filterProducts(products, query), [products, query]);
  const filtered = query.category !== null || query.q.trim() !== "";
  const sortLabel: Record<SortKey, string> = {
    newest: t.sortNewest,
    "price-asc": t.sortPriceAsc,
    "price-desc": t.sortPriceDesc,
  };

  const selectClass =
    "h-11 w-full cursor-pointer rounded-full border border-line-strong bg-surface pl-4 pr-9 text-sm text-ink";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="relative flex-1 sm:max-w-md">
            <span className="sr-only">{t.searchLabel}</span>
            <IconSearch
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder={t.searchPlaceholder}
              className="h-11 w-full rounded-full border border-line-strong bg-surface pl-10 pr-11 text-[0.95rem] text-ink placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
            />
            {query.q && (
              <button
                type="button"
                onClick={() => update({ q: "" })}
                aria-label={t.clearSearch}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors duration-200 hover:bg-cream hover:text-ink"
              >
                <IconClose className="h-4 w-4" />
              </button>
            )}
          </label>

          {/* Sort — beside search from sm up */}
          <label className="relative hidden shrink-0 items-center gap-2 text-sm text-ink-soft sm:flex">
            <span>{t.sortLabel}</span>
            <select
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value as SortKey })}
              className={`${selectClass} w-auto`}
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {sortLabel[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Phones: two native selects — scale to any number of categories, never clip */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <label>
            <span className="sr-only">{t.categoryLabel}</span>
            <select
              value={query.category ?? ""}
              onChange={(event) => update({ category: event.target.value || null })}
              className={selectClass}
            >
              <option value="">
                {t.allCategories} ({products.length})
              </option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t.sortLabel}</span>
            <select
              value={query.sort}
              onChange={(event) => update({ sort: event.target.value as SortKey })}
              className={selectClass}
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {sortLabel[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* sm and up: wrapping chips with counts */}
        {categories.length > 0 && (
          <div role="group" aria-label={t.categoryLabel} className="hidden flex-wrap gap-2 sm:flex">
            {[{ slug: "", name: t.allCategories, count: products.length }, ...categories].map(
              (category) => {
                const active = (query.category ?? "") === category.slug;
                return (
                  <button
                    key={category.slug || "all"}
                    type="button"
                    onClick={() => update({ category: category.slug || null })}
                    aria-pressed={active}
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "border-ink bg-ink text-porcelain"
                        : "border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {category.name}
                    <span className={`tabular-nums ${active ? "text-porcelain/70" : "text-ink-faint"}`}>
                      {category.count}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex min-h-8 items-center gap-3 text-sm text-ink-faint" aria-live="polite">
        <span>
          {visible.length} {visible.length === 1 ? t.countOne : t.countMany}
        </span>
        {filtered && (
          <button
            type="button"
            onClick={() => update({ category: null, q: "" })}
            className="cursor-pointer font-semibold text-copper underline-offset-4 hover:underline"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">
            {query.q.trim() ? t.noMatchFor.replace("{q}", query.q.trim()) : t.noMatchTitle}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{t.noMatchBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => update({ category: null, q: "" })}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              {t.clearFilters}
            </button>
            <a
              href={whatsappLink(
                `Hello Oreste Utensils! Do you have ${query.q.trim() || "this"} in store?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-copper-deep"
            >
              <IconWhatsApp className="h-4 w-4" />
              {dict.catalog.askWhatsapp}
            </a>
          </div>
        </div>
      ) : (
        <ul role="list" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
