import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "./GoogleAnalytics";

/**
 * Site analytics. Vercel Analytics is cookieless and runs on Vercel. Google
 * Analytics 4 runs only when NEXT_PUBLIC_GA_ID is set AND the visitor has
 * accepted cookies.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <VercelAnalytics />
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}
