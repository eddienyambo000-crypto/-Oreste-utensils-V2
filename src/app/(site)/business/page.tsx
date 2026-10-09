import type { Metadata } from "next";
import { TradeQuoteForm } from "@/components/business/TradeQuoteForm";
import { IconArrowRight, IconCheck, IconShield, IconStore, IconTruck, IconWhatsApp } from "@/components/ui/icons";
import { BUSINESS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Kitchen Supplies for Restaurants, Hotels & Cafés in Kigali",
  description:
    "Oreste Utensils quotes cookware, dinnerware, glassware and appliances for restaurants, hotels, cafés and institutions in Kigali. One supplier, delivery across Kigali, pay on delivery. Request a trade quote.",
  alternates: { canonical: "/business" },
  openGraph: {
    title: "Trade quotes for Kigali kitchens — Oreste Utensils",
    description: "Cookware, dinnerware, glassware and appliances for restaurants, hotels and cafés, delivered across Kigali.",
  },
};

export default async function BusinessPage() {
  const dict = await getDictionary();
  const t = dict.business;
  const tradeWhatsApp = whatsappLink(
    "Hello Oreste Utensils! I'm buying for a business and would like a trade quote.",
  );

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
        <p className="text-sm font-medium text-ink-soft">
          <span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-copper align-middle" />
          {t.eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.3rem,6vw,4rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-balance">
          {t.titleA} <em className="font-medium italic text-copper">{t.titleEm}</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{t.lead}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#quote"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-7 font-semibold text-on-copper shadow-copper transition-colors duration-200 hover:bg-copper-deep"
          >
            {t.ctaQuote}
            <IconArrowRight className="h-4 w-4" />
          </a>
          <a
            href={tradeWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-6 font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            <IconWhatsApp aria-hidden className="h-5 w-5 text-whatsapp" />
            {t.ctaTalk}
          </a>
        </div>
        <ul role="list" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-sm text-ink-soft">
          <li className="flex items-center gap-2"><IconTruck aria-hidden className="h-4 w-4 text-copper" />{t.trust1}</li>
          <li className="flex items-center gap-2"><IconShield aria-hidden className="h-4 w-4 text-copper" />{t.trust2}</li>
          <li className="flex items-center gap-2"><IconStore aria-hidden className="h-4 w-4 text-copper" />{t.trust3}</li>
        </ul>
      </section>

      <section aria-labelledby="audience" className="border-y border-line bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="audience" className="text-sm font-semibold text-ink-soft">{t.audienceLabel}</h2>
          <ul role="list" className="mt-3 flex flex-wrap gap-2">
            {t.audience.map((item) => (
              <li key={item} className="rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="value" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <h2 id="value" className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
          {t.valueTitle}
        </h2>
        <ul role="list" className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.valueStack.map((item) => (
            <li key={item.t} className="flex gap-3.5">
              <IconCheck aria-hidden className="mt-1 h-5 w-5 shrink-0 text-copper" />
              <div>
                <h3 className="font-display text-lg font-semibold">{item.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.b}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="process" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h2 id="process" className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            {t.processTitle}
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {t.steps.map((step, index) => (
              <li key={step.t} className="rounded-2xl border border-line bg-porcelain p-6">
                <span className="font-display text-3xl font-semibold tabular-nums text-copper">{index + 1}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quote" aria-labelledby="quote-title" className="scroll-mt-20">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <h2 id="quote-title" className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {t.quoteTitle}
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{t.quoteBody}</p>
            <ul role="list" className="mt-7 space-y-3">
              {t.quotePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-ink-soft">
                  <IconCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href={tradeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              <IconWhatsApp aria-hidden className="h-5 w-5 text-whatsapp" />
              {t.quoteDirect} {BUSINESS.phoneDisplay}
            </a>
          </div>
          <TradeQuoteForm />
        </div>
      </section>
    </>
  );
}
