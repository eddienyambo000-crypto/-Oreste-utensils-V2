"use client";

import { useEffect, useState } from "react";
import { getStoredConsent, setAnalyticsConsent } from "@/lib/analytics";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Cookie-consent banner. Analytics storage defaults to denied (Consent Mode,
 * set in Analytics.tsx); this lets the visitor grant or refuse it, once.
 * Shows only until a choice is stored.
 */
export function ConsentBanner() {
  const { dict } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Decide after mount so SSR and first client render match (both render null).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (getStoredConsent() === null) setShow(true);
  }, []);

  if (!show) return null;
  const t = dict.consent;

  function choose(granted: boolean) {
    setAnalyticsConsent(granted);
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="toast-in fixed inset-x-3 bottom-24 z-70 rounded-2xl border border-line bg-surface p-4 shadow-card-hover md:inset-x-auto md:bottom-5 md:left-5 md:max-w-sm"
    >
      <p className="text-sm leading-relaxed text-ink-soft">{t.message}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose(true)}
          className="flex-1 cursor-pointer rounded-full bg-copper px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          {t.accept}
        </button>
        <button
          type="button"
          onClick={() => choose(false)}
          className="flex-1 cursor-pointer rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
        >
          {t.decline}
        </button>
      </div>
    </div>
  );
}
