export const LOCALES = ["en", "rw", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

/** Full names shown in the language menu. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "Français",
};

/** Two-letter tags shown on the compact switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  rw: "RW",
  fr: "FR",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
