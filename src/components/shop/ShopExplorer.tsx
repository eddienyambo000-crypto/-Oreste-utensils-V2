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

interface ShopExplorerProps {
  products: Product[];
  initialQuery: ShopQuery;
}

/**
 * Search and sort over the whole catalogue. Filtering is instant
 * (client-side) and mirrored into the URL with replaceState, so a refreshed,
 * shared or back-navigated page keeps the same view.
 */
export function ShopExplorer({ products, initialQuery }: ShopExplorerProps) {
  const { dict } = useLang();
  const t = dict.shop;
  const [query, setQuery] = useState<ShopQuery>(initialQuery);

  function update(patch: Partial<ShopQuery>) {
    setQuery((prev) => {
      const next = { ...prev, ...patch };
      window.history.replaceState(null, "", `${window.location.pathname}${shopQueryString(next)}`);
      return next;
    });
  }

  const visible = useMemo(() => filterProducts(products, query), [products, query]);
  const searching = query.q.trim() !== "";
  const sortLabel: Record<SortKey, string> = {
    newest: t.sortNewest,
    "price-asc": t.sortPriceAsc,
    "price-desc": t.sortPriceDesc,
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <label className="relative min-w-0 flex-1 sm:max-w-md">
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
            className="h-12 w-full rounded-full border border-line-strong bg-surface pl-10 pr-11 text-base text-ink placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {query.q && (
            <button
              type="button"
              onClick={() => update({ q: "" })}
              aria-label={t.clearSearch}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors duration-200 hover:bg-cream hover:text-ink"
            >
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </label>

        <label className="flex shrink-0 items-center gap-2 text-sm text-ink-soft">
          <span className="sr-only sm:not-sr-only">{t.sortLabel}</span>
          <select
            value={query.sort}
            onChange={(event) => update({ sort: event.target.value as SortKey })}
            className="h-12 max-w-[9.5rem] cursor-pointer rounded-full border border-line-strong bg-surface pl-4 pr-8 text-sm text-ink sm:max-w-none"
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {sortLabel[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Keeps the outline h1 → h2 → product h3 for screen-reader navigation. */}
      <h2 className="sr-only">{t.resultsHeading}</h2>
      <div className="mt-4 flex min-h-8 items-center gap-3 text-sm text-ink-faint" aria-live="polite">
        <span>
          {visible.length} {visible.length === 1 ? t.countOne : t.countMany}
        </span>
        {searching && (
          <button
            type="button"
            onClick={() => update({ q: "" })}
            className="min-h-8 cursor-pointer font-semibold text-copper underline-offset-4 hover:underline"
          >
            {t.clearSearch}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <p className="font-display text-xl font-semibold">{t.noMatchFor.replace("{q}", query.q.trim())}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{t.noMatchBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => update({ q: "" })}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              {t.clearSearch}
            </button>
            <a
              href={whatsappLink(`Hello Oreste Utensils! Do you have ${query.q.trim()} in store?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-5 text-sm font-semibold text-on-copper transition-colors duration-200 hover:bg-copper-deep"
            >
              <IconWhatsApp aria-hidden className="h-4 w-4" />
              {dict.catalog.askWhatsapp}
            </a>
          </div>
        </div>
      ) : (
        <ul role="list" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
