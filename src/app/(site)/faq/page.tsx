import type { Metadata } from "next";
import Link from "next/link";
import { ServiceFacts } from "@/components/shop/ServiceFacts";
import { IconChevronDown, IconWhatsApp } from "@/components/ui/icons";
import { getFreeDeliveryThreshold } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Delivery, Payment & FAQ",
  description:
    "Ordering from Oreste Utensils in Kigali: delivery across the city, pay cash or MoMo on delivery, free pickup at City Plaza, opening hours and returns.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [dict, threshold] = await Promise.all([getDictionary(), getFreeDeliveryThreshold()]);
  const t = dict.faq;
  // One source for the visible answers and the FAQPage structured data.
  const items = t.items.map((item) => ({
    q: item.q,
    a: item.a.replace("{amount}", formatRwf(threshold)),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{t.title}</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{t.intro}</p>
      </header>

      <ServiceFacts dict={dict} threshold={threshold} className="mt-8" />

      <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
        {items.map((item) => (
          <details key={item.q} className="group px-5 sm:px-6">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <IconChevronDown
                aria-hidden
                className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="pb-5 leading-relaxed text-ink-soft">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-cream/60 px-6 py-10 text-center">
        <h2 className="font-display text-xl font-semibold">{t.stillTitle}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{t.stillBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink("Hello Oreste Utensils! I have a question about ordering.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-porcelain transition-colors duration-200 hover:bg-ink/85"
          >
            <IconWhatsApp aria-hidden className="h-5 w-5" />
            {dict.common.chatWithUs}
          </a>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-6 font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            {dict.common.browseShop}
          </Link>
        </div>
      </div>
    </div>
  );
}
