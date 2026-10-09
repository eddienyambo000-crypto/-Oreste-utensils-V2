"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";

interface LanguageContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Holds the active locale for client components. The server passes in only
 * the active dictionary (from the locale cookie), so a phone never downloads
 * the other languages and client and server render the same text. Switching
 * writes the cookie and refreshes, and the server sends the new dictionary.
 */
export function LanguageProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      try {
        localStorage.setItem(LOCALE_COOKIE, next);
      } catch {
        // Storage blocked — the cookie still carries the choice.
      }
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dict, setLocale }),
    [locale, dict, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return context;
}
