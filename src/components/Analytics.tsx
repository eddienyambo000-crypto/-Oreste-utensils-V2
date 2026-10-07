import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Site analytics. Vercel Analytics runs automatically on Vercel. Google
 * Analytics 4 loads only when NEXT_PUBLIC_GA_ID is set, so the site works
 * with or without a GA property configured.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <VercelAnalytics />
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              // Consent Mode v2: storage denied until the visitor accepts in the
              // cookie banner (Rwanda Law N°058/2021 + GDPR). The banner calls
              // gtag('consent','update',...) on accept.
              var ccPrior = 'denied';
              try {
                if (localStorage.getItem('cookie-consent') === 'granted') ccPrior = 'granted';
              } catch (e) {}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: ccPrior,
                wait_for_update: 500,
              });
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
