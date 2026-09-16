import type { Metadata } from "next";
import { TradeQuoteForm } from "@/components/business/TradeQuoteForm";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconArrowRight,
  IconCheck,
  IconShield,
  IconStore,
  IconTruck,
  IconWhatsApp,
} from "@/components/ui/icons";
import { BUSINESS } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Wholesale Kitchen Supplier for Restaurants & Hotels in Kigali",
  description:
    "Oreste Utensils supplies restaurants, hotels, cafés and institutions across Kigali with cookware, tableware, cutlery and appliances at trade prices. One supplier, consistent restock, delivery across Kigali. Get a wholesale quote.",
  alternates: { canonical: "/business" },
  openGraph: {
    title: "Wholesale Kitchenware for Restaurants & Hotels — Oreste Utensils",
    description:
      "Trade pricing, consistent restock and delivery across Kigali for restaurants, hotels, cafés and institutions.",
  },
};

export default async function BusinessPage() {
  const dict = await getDictionary();
  const t = dict.business;
  const tradeWhatsApp = whatsappLink(
    "Hello Oreste Utensils! I run a business and I'd like wholesale/trade pricing.",
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-ink text-porcelain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-tint">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.06] tracking-[-0.03em] sm:text-6xl">
              {t.titleA}
              <br />
              <em className="italic text-copper-tint">{t.titleEm}</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-porcelain/75">
              {t.lead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#quote"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
              >
                {t.ctaQuote}
                <IconArrowRight className="h-4 w-4" />
              </a>
              <a
                href={tradeWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-porcelain/25 px-7 py-3.5 font-medium text-porcelain transition-colors duration-200 hover:border-copper hover:text-copper-tint active:scale-[0.98]"
              >
                <IconWhatsApp className="h-4 w-4" />
                {t.ctaTalk}
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-porcelain/70">
              <li className="flex items-center gap-2">
                <IconTruck className="h-4 w-4 text-copper-tint" /> {t.trust1}
              </li>
              <li className="flex items-center gap-2">
                <IconShield className="h-4 w-4 text-copper-tint" /> {t.trust2}
              </li>
              <li className="flex items-center gap-2">
                <IconStore className="h-4 w-4 text-copper-tint" /> {t.trust3}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Audience ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
            {t.audienceLabel}
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {t.audience.map((item) => (
              <li key={item} className="font-display text-lg font-semibold text-ink/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Value stack ──────────────────────────────────────── */}
      <section aria-labelledby="value-heading" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
                {t.valueEyebrow}
              </p>
              <h2
                id="value-heading"
                className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
              >
                {t.valueTitle}
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {t.valueStack.map((item, index) => (
              <Reveal key={item.t} delay={index * 60}>
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper-tint text-copper">
                    <IconCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{item.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {item.b}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantee ────────────────────────────────────────── */}
      <section className="bg-cream/60 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-copper text-white shadow-copper">
              <IconShield className="h-7 w-7" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
              {t.guaranteeTitle}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              {t.guaranteeBody}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section aria-labelledby="process-heading" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2
              id="process-heading"
              className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
            >
              {t.processTitle}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {t.steps.map((step, index) => (
              <Reveal key={step.t} delay={index * 80}>
                <div className="relative rounded-2xl border border-line bg-surface p-6">
                  <span className="font-display text-4xl font-bold text-copper/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold">
                    {step.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.b}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote form ───────────────────────────────────────── */}
      <section id="quote" className="scroll-mt-20 bg-surface py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
              {t.quoteEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
              {t.quoteTitle}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
              {t.quoteBody}
            </p>
            <div className="mt-8 space-y-4">
              {t.quotePoints.map((point) => (
                <p key={point} className="flex items-start gap-3 text-ink-soft">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                  {point}
                </p>
              ))}
            </div>
            <a
              href={tradeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-porcelain px-6 py-3 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5 text-[#25D366]" />
              {t.quoteDirect} {BUSINESS.phoneDisplay}
            </a>
          </Reveal>
          <Reveal delay={100}>
            <TradeQuoteForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
