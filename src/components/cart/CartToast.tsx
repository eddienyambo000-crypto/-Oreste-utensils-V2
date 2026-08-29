"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";
import { IconCheck } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Lightweight "added to cart" confirmation. Replaces force-opening the whole
 * drawer on every add, so people can keep browsing — with a one-tap "View cart"
 * when they're ready. Auto-dismisses (timer lives in CartProvider).
 */
export function CartToast() {
  const { toast, openCart, dismissToast } = useCart();
  const { dict } = useLang();
  if (!toast) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-60 flex justify-center px-4 md:bottom-6"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-card-hover"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
          {toast.image && (
            <Image src={toast.image} alt="" fill sizes="48px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-semibold text-sage">
            <IconCheck className="h-3.5 w-3.5" />
            {dict.common.addedToCart}
          </p>
          <p className="truncate text-sm font-medium text-ink">{toast.name}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissToast();
            openCart();
          }}
          className="shrink-0 cursor-pointer rounded-full bg-copper px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-copper-deep active:scale-95"
        >
          {dict.common.viewCart}
        </button>
      </div>
    </div>
  );
}
