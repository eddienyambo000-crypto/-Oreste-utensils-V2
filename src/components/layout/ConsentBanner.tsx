"use client";

import { useSyncExternalStore } from "react";
import { getStoredConsent, setAnalyticsConsent, subscribeConsent } from "@/lib/analytics";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Cookie-consent banner. Nothing that sets cookies runs until the visitor
 * accepts; the banner shows while no choice is stored, and again after
 * "Cookie settings" in the footer clears it.
 */
export function ConsentBanner() {
  const { dict } = useLang();
  // The server snapshot reports "decided" so SSR and hydration render nothing.
  const undecided = useSyncExternalStore(
    subscribeConsent,
    () => getStoredConsent() === null,
    () => false,
  );
  if (!undecided) return null;
  const t = dict.consent;

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="toast-in fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-70 rounded-2xl border border-line bg-surface p-4 shadow-card-hover md:inset-x-auto md:bottom-5 md:left-5 md:max-w-sm"
    >
      <p className="text-sm leading-relaxed text-ink-soft">{t.message}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setAnalyticsConsent(true)}
          className="min-h-11 flex-1 cursor-pointer rounded-full bg-copper px-4 text-sm font-semibold text-on-copper transition-colors duration-200 hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98]"
        >
          {t.accept}
        </button>
        <button
          type="button"
          onClick={() => setAnalyticsConsent(false)}
          className="min-h-11 flex-1 cursor-pointer rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98]"
        >
          {t.decline}
        </button>
      </div>
    </div>
  );
}
