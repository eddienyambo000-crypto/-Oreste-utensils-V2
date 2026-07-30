import type { Metadata } from "next";
import Link from "next/link";
import { IconChevronDown, IconWhatsApp } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { FAQS } from "@/lib/faq";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Delivery, Payment & FAQ",
  description:
    "Everything about ordering from Oreste Utensils in Kigali — delivery across the city, free delivery over 500,000 RWF, pay cash or MoMo on delivery, returns, and opening hours.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Reveal>
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Good to know
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            Delivery, payment &amp; FAQ
          </h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            The quick answers on ordering, delivery and payment. Anything else, we&apos;re
            a WhatsApp message away.
          </p>
        </header>
      </Reveal>

      <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
        {FAQS.map((faq, index) => (
          <Reveal key={faq.question} delay={index * 45}>
            <details className="group px-5 py-1 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <IconChevronDown className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 leading-relaxed text-ink-soft">{faq.answer}</p>
            </details>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-cream/60 px-6 py-10 text-center">
        <h2 className="font-display text-xl font-semibold">Still have a question?</h2>
        <p className="max-w-sm text-sm text-ink-soft">
          Message us on WhatsApp and a real person will get back to you — usually
          within minutes during opening hours.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink("Hello Oreste Utensils! I have a question about ordering.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <IconWhatsApp className="h-5 w-5" />
            Chat with us
          </a>
          <Link
            href="/shop"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
          >
            Browse the shop
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
