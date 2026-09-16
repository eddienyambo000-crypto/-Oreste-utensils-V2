import type { CartItem, Product } from "./types";

/** Cap per-line quantity so a fat-fingered "99999" can't be ordered. */
export const MAX_QTY = 99;

/** Total number of units across all lines (the header badge count). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Order subtotal in RWF. */
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceRwf * item.quantity, 0);
}

/**
 * Adds a product, merging with an existing line and clamping to MAX_QTY.
 * Pure: returns a new array, never mutates the input.
 */
export function addToCart(
  items: CartItem[],
  product: Product,
  quantity = 1,
): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QTY) }
        : item,
    );
  }
  return [
    ...items,
    {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceRwf: product.priceRwf,
      image: product.images[0] ?? "",
      quantity,
    },
  ];
}

/** Sets a line's quantity; a quantity below 1 removes the line entirely. */
export function setItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity < 1) return removeFromCart(items, productId);
  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.min(quantity, MAX_QTY) }
      : item,
  );
}

/** Removes a line by product id. */
export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

/** Whether an order qualifies for free delivery. */
export function qualifiesForFreeDelivery(
  subtotal: number,
  threshold: number,
  fulfillment: "delivery" | "pickup",
): boolean {
  return fulfillment === "pickup" || subtotal >= threshold;
}
