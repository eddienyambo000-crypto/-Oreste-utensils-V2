"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem, Product } from "@/lib/types";

interface CartToastState {
  id: number;
  name: string;
  image: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toast: CartToastState | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productId === "string" &&
        typeof (item as CartItem).quantity === "number" &&
        (item as CartItem).quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<CartToastState | null>(null);
  const hydrated = useRef(false);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // One-time hydration from localStorage. This must happen in an effect
    // (not a lazy initializer) so the server and first client render both
    // start from an empty cart — otherwise the header count badge would
    // mismatch during hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStoredCart());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked — the cart still works for this session.
    }
  }, [items]);

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceRwf: product.priceRwf,
          image: product.images[0] ?? "",
          quantity,
        },
      ];
    });
    // Feedback without interrupting the browse: a toast + badge bump instead of
    // force-opening the whole drawer on every add.
    setToast({ id: Date.now(), name: product.name, image: product.images[0] ?? "" });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, 99) }
          : item,
      ),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.priceRwf * item.quantity,
      0,
    );
    return {
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      toast,
      dismissToast,
    };
  }, [items, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, clearCart, toast, dismissToast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
