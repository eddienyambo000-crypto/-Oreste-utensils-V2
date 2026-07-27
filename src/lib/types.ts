/**
 * Category slug. The launch set is cookware, dinnerware, cutlery, storage,
 * small-appliances and serveware, but categories are managed from the admin
 * panel so any slug is valid at runtime.
 */
export type CategorySlug = string;

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

export const BUSINESS_TYPES = [
  "Restaurant",
  "Hotel / Lodge",
  "Café / Bakery",
  "Catering / Events",
  "School / Institution",
  "Retailer / Reseller",
  "Other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface Testimonial {
  id: string;
  clientName: string;
  business: string | null;
  quote: string;
  photo: string | null;
  rating: number;
  sortOrder: number;
  createdAt: string;
}

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  businessType: string;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
}
