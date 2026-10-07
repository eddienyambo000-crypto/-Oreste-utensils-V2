import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialCard } from "@/components/shop/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { IconArrowRight, IconWhatsApp } from "@/components/ui/icons";
import { getTestimonials } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Reviews from people who have ordered kitchenware from Oreste Utensils, City Plaza, Kigali.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const [testimonials, dict] = await Promise.all([
    getTestimonials(),
    getDictionary(),
  ]);

  // No Review/Rating structured data: testimonials are published by the shop
  // itself, which search engines treat as self-serving and ineligible.
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          {dict.reviews.title}
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">{dict.reviews.intro}</p>
      </header>

      {testimonials.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={t.id} delay={index * 60}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <p className="text-ink-soft">{dict.reviews.emptyBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink("Hello Oreste Utensils!")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-ink px-6 font-semibold text-porcelain transition-colors duration-200 hover:bg-ink/85"
            >
              <IconWhatsApp aria-hidden className="h-5 w-5" />
              {dict.common.chatWithUs}
            </a>
            <Link
              href="/shop"
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-6 font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              {dict.common.browseShop}
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
