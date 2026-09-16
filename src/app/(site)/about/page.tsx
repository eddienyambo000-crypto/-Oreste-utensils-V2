import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconArrowRight,
  IconShield,
  IconStore,
  IconTruck,
} from "@/components/ui/icons";
import { getSiteImages } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "About Oreste Utensils",
  description:
    "Oreste Utensils is a premium kitchenware brand and retailer based at City Plaza, Kigali, Rwanda — supplying exclusive, modern home and kitchen essentials with delivery across Kigali.",
  alternates: { canonical: "/about" },
};

const VALUE_ICONS = [IconStore, IconShield, IconTruck];

export default async function AboutPage() {
  const [siteImages, dict] = await Promise.all([getSiteImages(), getDictionary()]);
  const t = dict.about;
  return (
    <div>
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
              {t.title}
            </h1>
            {/* Plain, extractable factual lead — good for AI answer engines. */}
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t.lead}</p>
            <p className="mt-4 leading-relaxed text-ink-soft">{t.para2}</p>
          </div>
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card-hover">
              <Image
                src={siteImages.about_image}
                alt={t.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-heading" className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="values-heading" className="sr-only">
            {dict.home.guaranteesTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {t.values.map((value, index) => {
              const Icon = VALUE_ICONS[index];
              return (
                <Reveal key={value.t} delay={index * 80}>
                  <div className="h-full rounded-2xl border border-line bg-surface p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-copper-tint text-copper">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      {value.t}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {value.b}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-porcelain sm:px-12">
          <h2 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-porcelain/70">{t.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
            >
              {dict.hero.cta}
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-porcelain/25 px-7 py-3.5 font-medium text-porcelain transition-colors duration-200 hover:border-copper hover:text-copper-tint active:scale-[0.98]"
            >
              {dict.footer.visitStore}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
