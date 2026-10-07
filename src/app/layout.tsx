import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} — Kitchenware Shop in Kigali, Rwanda`,
    template: `%s — ${BUSINESS.name}`,
  },
  description: BUSINESS.description,
  keywords: [
    "kitchenware Kigali",
    "utensils shop Kigali",
    "cookware Rwanda",
    "kitchen accessories Kigali",
    "City Plaza kitchen shop",
    "Oreste Utensils",
  ],
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — Kitchenware Shop in Kigali, Rwanda`,
    description: BUSINESS.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — Kitchenware Shop in Kigali, Rwanda`,
    description: BUSINESS.description,
  },
  alternates: { canonical: "/" },
  // Set GOOGLE_SITE_VERIFICATION once to verify ownership in Search Console —
  // no code change or redeploy needed, just the env var.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#15120c" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The visitor's chosen language, so screen readers and translation tools
  // treat Kinyarwanda and French pages as what they are.
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Applies the saved theme before paint (no flash) and marks JS
            availability so scroll-reveal styles only hide content when they
            can un-hide it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}document.documentElement.classList.add('js');})();",
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
