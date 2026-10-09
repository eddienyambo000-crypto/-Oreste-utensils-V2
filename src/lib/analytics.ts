/**
 * Consent + GA4 helpers. Google Analytics loads only after the visitor
 * accepts (see GoogleAnalytics.tsx), so before that every helper here is a
 * safe no-op and no tracking script runs at all.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, unknown>;
export type ConsentState = "granted" | "denied" | null;

const CONSENT_KEY = "cookie-consent";
const CONSENT_EVENT = "oreste:consent";

/** Fire a GA4 event (conversion funnel, etc.). Safe to call anywhere. */
export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

export function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** For useSyncExternalStore: re-read consent when it changes (any tab). */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeConsent(value: ConsentState): void {
  try {
    if (value) localStorage.setItem(CONSENT_KEY, value);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked — the choice still applies to this page view.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Persist the visitor's choice; an already-loaded GA tag is told as well. */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  writeConsent(granted ? "granted" : "denied");
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
  }
}

/** Forget the choice so the banner asks again ("Cookie settings" link). */
export function resetConsent(): void {
  if (typeof window === "undefined") return;
  writeConsent(null);
}
