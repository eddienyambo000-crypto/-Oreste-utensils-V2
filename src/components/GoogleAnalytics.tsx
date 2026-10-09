"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { getStoredConsent, subscribeConsent } from "@/lib/analytics";

/**
 * Google Analytics 4, loaded only once the visitor has accepted cookies
 * (Rwanda Law N° 058/2021 on personal data; GDPR for visitors from the EU).
 * Until then no Google script is requested, which also keeps the first visit
 * fast. Declining later stops collection via Consent Mode.
 */
export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const granted = useSyncExternalStore(
    subscribeConsent,
    () => getStoredConsent() === "granted",
    () => false,
  );
  if (!granted) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
