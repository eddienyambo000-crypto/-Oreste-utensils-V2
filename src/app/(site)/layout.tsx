import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getFreeDeliveryThreshold } from "@/lib/data";
import { BUSINESS, SITE_URL } from "@/lib/constants";

function StoreJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    "@id": `${SITE_URL}/#store`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.phoneE164,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressCountry: BUSINESS.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: BUSINESS.hours.opens,
      closes: BUSINESS.hours.closes,
    },
    sameAs: [BUSINESS.instagram],
    priceRange: "RWF",
    currenciesAccepted: "RWF",
    paymentAccepted: "Cash, Mobile Money",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const threshold = await getFreeDeliveryThreshold();

  return (
    <CartProvider>
      <StoreJsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-porcelain"
      >
        Skip to main content
      </a>
      <AnnouncementBar threshold={threshold} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer freeDeliveryThreshold={threshold} />
      <WhatsAppButton />
    </CartProvider>
  );
}
