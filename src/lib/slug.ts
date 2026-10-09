/**
 * URL slug from a product name: "Poêle 28 cm" → "poele-28-cm".
 * Accents are folded rather than dropped so French names keep their letters.
 */
export function slugify(value: string, maxLength = 80): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

/** Shortens text to at most `max` characters on a word boundary, with "…". */
export function summarize(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.replace(/\s+\S*$/, "");
  return `${(atWord.length > max / 2 ? atWord : cut).trimEnd()}…`;
}

/** A slug that is never empty — names made only of symbols get a fallback. */
export function slugOrFallback(value: string, fallback: string): string {
  const slug = slugify(value);
  return slug.length >= 2 ? slug : fallback;
}
