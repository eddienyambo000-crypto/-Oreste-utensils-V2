import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { BUSINESS, SITE_URL } from "@/lib/constants";
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
    default: `${BUSINESS.name} — Premium Kitchenware in Kigali, Rwanda`,
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
    title: `${BUSINESS.name} — Premium Kitchenware in Kigali, Rwanda`,
    description: BUSINESS.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — Premium Kitchenware in Kigali, Rwanda`,
    description: BUSINESS.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* Marks JS availability so scroll-reveal styles only hide content when they can un-hide it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {children}
      </body>
    </html>
  );
}
