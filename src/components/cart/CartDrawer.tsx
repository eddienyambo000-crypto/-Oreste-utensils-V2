"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { FreeDeliveryMeter } from "./FreeDeliveryMeter";
import { formatRwf } from "@/lib/format";
import {
  IconArrowRight,
  IconBag,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@/components/ui/icons";

export function CartDrawer({ freeDeliveryThreshold }: { freeDeliveryThreshold: number }) {
  const { items, subtotal, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management + escape + scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <div
        className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-porcelain shadow-drawer transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Your cart
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="cursor-pointer rounded-full p-2 text-ink-soft transition-colors duration-200 hover:bg-cream hover:text-ink active:scale-95"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-ink-faint">
              <IconBag className="h-6 w-6" />
            </span>
            <p className="text-ink-soft">Your cart is empty — for now.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-porcelain transition-colors duration-200 hover:bg-copper-deep active:scale-[0.98]"
            >
              Browse the shop
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="relative flex-1 min-h-0">
              <ul className="absolute inset-0 divide-y divide-line overflow-y-auto px-5">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4 py-4">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-medium text-ink transition-colors duration-200 hover:text-copper"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="cursor-pointer rounded p-1 text-ink-faint transition-colors duration-200 hover:text-copper-deep active:scale-95"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-line-strong">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="cursor-pointer p-1.5 text-ink-soft transition-colors duration-200 hover:text-ink active:scale-90"
                          >
                            <IconMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="cursor-pointer p-1.5 text-ink-soft transition-colors duration-200 hover:text-ink active:scale-90"
                          >
                            <IconPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatRwf(item.priceRwf * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t border-line bg-surface px-5 py-5">
              <FreeDeliveryMeter subtotal={subtotal} threshold={freeDeliveryThreshold} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">Subtotal</span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {formatRwf(subtotal)}
                </span>
              </div>
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-6 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
              >
                Review order &amp; checkout
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-xs text-ink-faint">
                Pay cash or MoMo on delivery — nothing online.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
