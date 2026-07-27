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
  geo: { latitude: -1.9441, longitude: 30.0619 },
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
 * Editable site photos. Keys map to rows in ou_settings; defaults are the
 * bundled images. The admin can swap any of these from Settings → Site photos.
 */
export const SITE_IMAGE_KEYS = {
  hero_image: "/images/hero-kitchen.webp",
  story_image_1: "/images/story-cooking.webp",
  story_image_2: "/images/story-searing.webp",
  about_image: "/images/about-kitchen.webp",
  visit_image: "/images/visit-kitchen.webp",
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGE_KEYS;

export const SITE_IMAGE_LABELS: Record<SiteImageKey, string> = {
  hero_image: "Homepage hero",
  story_image_1: "Story photo (left)",
  story_image_2: "Story photo (right)",
  about_image: "About page photo",
  visit_image: "Visit-the-store photo",
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
