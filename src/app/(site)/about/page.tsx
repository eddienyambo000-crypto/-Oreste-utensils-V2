import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconShield, IconStore, IconTruck } from "@/components/ui/icons";
import { getFreeDeliveryThreshold, getSiteImages } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "About Oreste Utensils",
  description:
    "Oreste Utensils is a kitchenware shop at City Plaza, Kigali, Rwanda — cookware, dinnerware, glassware and small appliances, delivered across Kigali and paid for on delivery.",
  alternates: { canonical: "/about" },
};

const POINT_ICONS = [IconStore, IconTruck, IconShield];

export default async function AboutPage() {
  const [siteImages, dict, threshold] = await Promise.all([
    getSiteImages(),
    getDictionary(),
    getFreeDeliveryThreshold(),
  ]);
  const t = dict.about;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-[-0.03em] text-balance sm:text-5xl">
            {t.title}
          </h1>
          {/* Plain, factual sentences — the kind answer engines quote verbatim. */}
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t.lead}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">{t.para2}</p>
        </div>
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={siteImages.about_image}
              alt={t.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </figure>
      </div>

      <section aria-labelledby="points" className="mt-16 lg:mt-24">
        <h2 id="points" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          {t.pointsTitle}
        </h2>
        <ul role="list" className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {t.points.map((point, index) => {
            const Icon = POINT_ICONS[index] ?? IconStore;
            return (
              <li key={point.t} className="bg-surface p-6">
                <Icon aria-hidden className="h-6 w-6 text-copper" />
                <h3 className="mt-4 font-display text-lg font-semibold">{point.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {point.b.replace("{amount}", formatRwf(threshold))}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-16 flex flex-col items-start gap-5 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">{t.ctaTitle}</h2>
          <p className="mt-1.5 text-ink-soft">{t.ctaBody}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-6 font-semibold text-on-copper shadow-copper transition-colors duration-200 hover:bg-copper-deep"
          >
            {dict.hero.cta}
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center rounded-full border border-line-strong px-6 font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            {dict.common.visitStore}
          </Link>
        </div>
      </section>
    </div>
  );
}
