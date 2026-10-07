/**
 * Thin GA4 helpers. Everything no-ops when GA isn't loaded (no NEXT_PUBLIC_GA_ID,
 * or consent not yet granted), so callers never need to guard.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, unknown>;

const CONSENT_KEY = "cookie-consent";

/** Fire a GA4 event (conversion funnel, etc.). Safe to call anywhere. */
export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}

export function getStoredConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Persist the choice and tell Consent Mode about it. */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage blocked — the choice holds for this page view via gtag below.
  }
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
  }
}
