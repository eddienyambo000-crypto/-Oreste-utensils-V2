/**
 * Google review link. The printed QR card points at /review on this site,
 * which forwards here, so the card never needs reprinting when the link
 * changes. The owner pastes the official link once in Admin → Settings
 * (Google Business Profile → "Ask for reviews" → copy link).
 */

/** Where /review sends people until the owner has saved the official link. */
export const GOOGLE_REVIEW_FALLBACK =
  "https://www.google.com/maps/search/?api=1&query=Oreste%20Utensils%20City%20Plaza%20Kigali";

const GOOGLE_HOSTS = new Set([
  "g.page",
  "search.google.com",
  "www.google.com",
  "google.com",
  "maps.google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

/** True for an https link on a Google review/Maps host. */
export function isGoogleReviewUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && GOOGLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** The saved link if it is a valid Google link, otherwise the Maps search. */
export function reviewDestination(saved: string | null | undefined): string {
  return saved && isGoogleReviewUrl(saved) ? saved.trim() : GOOGLE_REVIEW_FALLBACK;
}
