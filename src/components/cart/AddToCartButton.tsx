"use client";

import { useCart } from "./CartProvider";
import { productInquiryLink } from "@/lib/whatsapp";
import { IconBag, IconWhatsApp } from "@/components/ui/icons";
import type { Product } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
  size?: "default" | "large";
}

export function AddToCartButton({ product, size = "default" }: AddToCartButtonProps) {
  const { addItem } = useCart();

  const sizing =
    size === "large"
      ? "px-8 py-4 text-base"
      : "px-5 py-2.5 text-sm";

  if (!product.inStock) {
    return (
      <a
        href={productInquiryLink(product.name)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface font-medium text-ink-soft transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98] ${sizing}`}
      >
        <IconWhatsApp className="h-4 w-4" />
        Out of stock — ask on WhatsApp
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-copper font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] ${sizing}`}
    >
      <IconBag className="h-4 w-4" />
      Add to cart
    </button>
  );
}
