"use client";

import { useEffect, useRef, useState } from "react";
import { IconGlobe } from "@/components/ui/icons";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";
import { useLang } from "@/lib/i18n/LanguageProvider";

/** English / Kinyarwanda / Français picker. Writes the cookie + refreshes. */
export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.language.change}
        className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-2 text-ink transition-colors duration-200 hover:bg-cream active:scale-95"
      >
        <IconGlobe className="h-5 w-5" />
        <span className="text-xs font-semibold tabular-nums">
          {LOCALE_SHORT[locale]}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-card-hover"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-cream ${
                l === locale ? "font-semibold text-copper" : "text-ink"
              }`}
            >
              {LOCALE_LABELS[l]}
              <span className="text-xs text-ink-faint">{LOCALE_SHORT[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
