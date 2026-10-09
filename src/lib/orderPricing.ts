import type { CartItem } from "./types";

/** What the server knows about a product when pricing an order. */
export interface PricedProduct {
  id: string;
  slug: string;
  name: string;
  priceRwf: number;
  inStock: boolean;
  image: string;
}

export type PricedOrder =
  | { ok: true; items: CartItem[]; subtotal: number }
  | { ok: false; unavailable: string[] };

/**
 * Re-prices a cart against the catalogue. The browser only says *which*
 * products and *how many*; names and prices always come from the database,
 * so an edited request (or a cart saved before a price change) can never set
 * its own price. Unknown or sold-out lines make the order unavailable, naming
 * them so the customer can fix their cart.
 */
export function priceOrder(
  lines: { productId: string; name: string; quantity: number }[],
  catalogue: Map<string, PricedProduct>,
): PricedOrder {
  const unavailable: string[] = [];
  const items: CartItem[] = [];

  for (const line of lines) {
    const product = catalogue.get(line.productId);
    if (!product || !product.inStock) {
      unavailable.push(product?.name ?? line.name);
      continue;
    }
    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + line.quantity);
      continue;
    }
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceRwf: product.priceRwf,
      image: product.image,
      quantity: line.quantity,
    });
  }

  if (unavailable.length > 0) return { ok: false, unavailable };
  const subtotal = items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);
  return { ok: true, items, subtotal };
}
