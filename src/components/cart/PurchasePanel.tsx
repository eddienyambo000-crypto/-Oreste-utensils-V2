"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { IconBag, IconMinus, IconPlus, IconWhatsApp } from "@/components/ui/icons";
import { trackEvent } from "@/lib/analytics";
import { MAX_QTY } from "@/lib/cart";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { Product } from "@/lib/types";
import { productInquiryLink } from "@/lib/whatsapp";

/**
 * Quantity + add to cart, with a WhatsApp question as the secondary action.
 * A sold-out product can't be added; it offers to ask about availability.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { dict } = useLang();
  const t = dict.product;
  const [quantity, setQuantity] = useState(1);

  const ask = (
    <a
      href={productInquiryLink(product.name)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-6 font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
    >
      <IconWhatsApp className="h-5 w-5" />
      {product.inStock ? dict.common.askAboutItem : t.askAvailability}
    </a>
  );

  if (!product.inStock) {
    return <div className="flex">{ask}</div>;
  }

  function add() {
    addItem(product, quantity);
    trackEvent("add_to_cart", {
      currency: "RWF",
      value: product.priceRwf * quantity,
      items: [{ item_id: product.slug, item_name: product.name, quantity }],
    });
  }

  const step = (delta: number) =>
    setQuantity((q) => Math.min(MAX_QTY, Math.max(1, q + delta)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div
          role="group"
          aria-label={t.quantity}
          className="flex h-12 shrink-0 items-center rounded-full border border-line-strong bg-surface"
        >
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={quantity <= 1}
            aria-label={t.decrease}
            className="flex h-12 w-11 cursor-pointer items-center justify-center rounded-l-full text-ink-soft transition-colors duration-200 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="w-8 text-center font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={quantity >= MAX_QTY}
            aria-label={t.increase}
            className="flex h-12 w-11 cursor-pointer items-center justify-center rounded-r-full text-ink-soft transition-colors duration-200 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-6 font-semibold text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          <IconBag className="h-5 w-5" />
          {dict.common.addToCart}
        </button>
      </div>
      <div className="flex">{ask}</div>
    </div>
  );
}
