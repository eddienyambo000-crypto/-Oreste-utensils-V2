export type CategorySlug =
  | "cookware"
  | "dinnerware"
  | "cutlery"
  | "storage"
  | "small-appliances"
  | "serveware";

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  /** Longer crawlable intro shown on the category landing page. */
  intro: string;
  image: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: CategorySlug;
  priceRwf: number;
  /** One-line summary used on cards and meta descriptions. */
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  featured: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceRwf: number;
  image: string;
  quantity: number;
}

export type Fulfillment = "delivery" | "pickup";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OrderInput {
  customerName: string;
  phone: string;
  fulfillment: Fulfillment;
  deliveryArea: string | null;
  note: string | null;
  items: CartItem[];
}

export interface Order extends OrderInput {
  id: string;
  subtotalRwf: number;
  deliveryFree: boolean;
  totalRwf: number;
  status: OrderStatus;
  createdAt: string;
}
