/**
 * Single source of truth for Oreste Utensils business facts.
 * These values appear in the footer, contact page, JSON-LD, llms.txt and
 * the WhatsApp order flow — keep them consistent everywhere.
 */

export const BUSINESS = {
  name: "Oreste Utensils",
  legalName: "Oreste Utensils Ltd",
  tagline: "Everything your kitchen deserves.",
  description:
    "Oreste Utensils is a premium kitchenware brand and retailer based at City Plaza, Kigali, Rwanda — supplying exclusive, modern home and kitchen essentials with delivery across Kigali.",
  address: {
    street: "City Plaza",
    city: "Kigali",
    country: "Rwanda",
    countryCode: "RW",
  },
  /** Approximate coordinates of City Plaza, central Kigali. */
  phoneDisplay: "+250 783 399 163",
  phoneE164: "+250783399163",
  whatsappNumber: "250783399163",
  email: null,
  instagram: "https://www.instagram.com/oreste_utensils/",
  instagramHandle: "@oreste_utensils",
  hours: { opens: "08:00", closes: "21:00", days: "Monday – Sunday" },
  hoursDisplay: "8:00 AM – 9:00 PM, every day",
  mapsUrl: "https://maps.google.com/?q=City+Plaza,+Kigali,+Rwanda",
} as const;

// Trim whitespace and any trailing slash so an env value with stray
// whitespace can't leak a broken URL into the sitemap, robots.txt or JSON-LD.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oresteutensils.com"
)
  .trim()
  .replace(/\/+$/, "");

/** Orders at or above this subtotal get free delivery across Kigali (RWF). */
export const FREE_DELIVERY_THRESHOLD_RWF = 500_000;

export const CART_STORAGE_KEY = "oreste-cart-v1";

/**
 * Editable site photos. Keys map to rows in ou_settings (key names are kept
 * stable for stored values); defaults are bundled photos without people. A
 * real upload falls back down the chain in getSiteImages, so one shop photo
 * is enough to replace every stock image.
 */
export const SITE_IMAGE_KEYS = {
  hero_image: "/images/hero-kitchen.webp",
  story_image_1: "/images/kitchen-default.webp",
  about_image: "/images/kitchen-default.webp",
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGE_KEYS;

export const SITE_IMAGE_LABELS: Record<SiteImageKey, string> = {
  hero_image: "Homepage — main photo",
  story_image_1: "Homepage — shop & delivery photo",
  about_image: "About page photo",
};

export const KIGALI_AREAS = [
  "Nyarugenge (City Centre)",
  "Kacyiru",
  "Kimihurura",
  "Remera",
  "Gisozi",
  "Kicukiro",
  "Gikondo",
  "Nyamirambo",
  "Kimironko",
  "Kibagabaga",
  "Gacuriro",
  "Kanombe",
  "Other (tell us on WhatsApp)",
] as const;
