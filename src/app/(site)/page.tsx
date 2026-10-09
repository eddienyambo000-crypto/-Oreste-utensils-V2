import Image from "next/image";
import Link from "next/link";
import { CatalogNotice } from "@/components/shop/CatalogNotice";
import { ProductRail } from "@/components/shop/ProductRail";
import { ServiceFacts } from "@/components/shop/ServiceFacts";
import { TestimonialCard } from "@/components/shop/TestimonialCard";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMapPin,
  IconPhone,
  IconTruck,
} from "@/components/ui/icons";
import { homepageRail } from "@/lib/catalog";
import { BUSINESS } from "@/lib/constants";
import { getFreeDeliveryThreshold, getProducts, getSiteImages, getTestimonials } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import type { Product } from "@/lib/types";

/** The homepage degrades gracefully: if the catalogue can't load, the shop
 *  page reports it; here the product section simply steps aside. An empty
 *  catalogue is a different, honest state with its own message. */
async function loadCatalog(): Promise<{ ok: boolean; products: Product[] }> {
  try {
    return { ok: true, products: await getProducts() };
  } catch (error) {
    console.error("[home] catalogue failed to load:", error);
    return { ok: false, products: [] };
  }
}

export default async function HomePage() {
  const [catalog, testimonials, siteImages, threshold, dict] = await Promise.all([
    loadCatalog(),
    getTestimonials(),
    getSiteImages(),
    getFreeDeliveryThreshold(),
    getDictionary(),
  ]);
  const h = dict.hero;
  const t = dict.home;
  const rail = homepageRail(catalog.products);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          <div className="animate-fade-up">
            <p className="text-sm font-medium text-ink-soft">
              <span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-copper align-middle" />
              {h.label}
            </p>
            <h1
              id="hero-title"
              className="mt-5 font-display text-[clamp(2.6rem,7.5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance"
            >
              {h.titleLead} <em className="font-medium italic text-copper">{h.titleEm}</em>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-soft">{h.subtitle}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-7 font-semibold text-on-copper shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
              >
                {h.cta}
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center font-semibold text-ink underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors duration-200 hover:decoration-copper"
              >
                {h.secondary}
              </Link>
            </div>

            <ul role="list" className="mt-10 space-y-2.5 border-t border-line pt-5 text-sm text-ink-soft">
              {[
                { Icon: IconTruck, text: h.factDelivery.replace("{amount}", formatRwf(threshold)) },
                { Icon: IconCheck, text: h.factPayment },
                { Icon: IconClock, text: h.factHours },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <Icon aria-hidden className="h-4 w-4 shrink-0 text-copper" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <figure className="animate-fade-in" style={{ animationDelay: "120ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={siteImages.hero_image}
                alt={h.photoAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center gap-1.5 text-sm text-ink-faint">
              <IconMapPin aria-hidden className="h-4 w-4 text-copper" />
              {h.photoCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Real products, chosen in the admin ───────────────── */}
      {rail.length > 0 ? (
        <div className="border-t border-line">
          <ProductRail
            id="new-in-store"
            title={t.railTitle}
            actionLabel={t.railAction}
            actionHref="/shop"
            products={rail}
          />
        </div>
      ) : (
        catalog.ok &&
        catalog.products.length === 0 && (
          <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <CatalogNotice kind="empty" dict={dict} />
          </div>
        )
      )}

      {/* ── The shop + how ordering works ────────────────────── */}
      <section aria-labelledby="visit" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8 lg:py-20">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={siteImages.story_image_1}
                alt={t.visitPhotoAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
              />
            </div>
          </figure>

          <div className="flex flex-col justify-center">
            <h2 id="visit" className="font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-4xl">
              {t.visitTitle}
            </h2>
            <p className="mt-4 max-w-prose leading-relaxed text-ink-soft">{t.visitBody}</p>

            <h3 className="mt-9 text-sm font-semibold text-ink">{t.howTitle}</h3>
            <ol className="mt-4 space-y-4">
              {t.how.map((step, index) => (
                <li key={step.t} className="flex gap-4">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong font-display text-sm font-semibold tabular-nums text-copper"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{step.t}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{step.b}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ServiceFacts dict={dict} threshold={threshold} className="mt-9" />

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-start gap-2">
                <dt className="shrink-0">
                  <IconMapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  <span className="sr-only">{dict.contact.address}</span>
                </dt>
                <dd>
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-copper"
                  >
                    {BUSINESS.address.street}, {BUSINESS.address.city}
                  </a>
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <dt className="shrink-0">
                  <IconClock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  <span className="sr-only">{dict.contact.hours}</span>
                </dt>
                <dd className="font-medium text-ink">{h.factHours}</dd>
              </div>
              <div className="flex items-start gap-2">
                <dt className="shrink-0">
                  <IconPhone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                  <span className="sr-only">{dict.contact.phone}</span>
                </dt>
                <dd>
                  <a href={`tel:${BUSINESS.phoneE164}`} className="font-medium text-ink hover:text-copper">
                    {BUSINESS.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── Trade ────────────────────────────────────────────── */}
      <section aria-labelledby="trade" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 rounded-[1.75rem] border border-line-strong px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 id="trade" className="font-display text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
              {t.tradeTitle}
            </h2>
            <p className="mt-1.5 text-ink-soft">{t.tradeBody}</p>
          </div>
          <Link
            href="/business"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-6 font-semibold text-porcelain transition-colors duration-200 hover:bg-ink/85 sm:self-auto"
          >
            {t.tradeCta}
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Reviews (only real ones, added in the admin) ─────── */}
      {testimonials.length > 0 && (
        <section aria-labelledby="reviews" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="reviews" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              {t.reviewsTitle}
            </h2>
            <Link
              href="/testimonials"
              className="inline-flex shrink-0 items-center gap-1.5 py-2 text-sm font-semibold text-copper transition-colors duration-200 hover:text-copper-deep"
            >
              {t.reviewsMore}
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul role="list" className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
