import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialCard } from "@/components/shop/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { IconArrowRight, IconWhatsApp } from "@/components/ui/icons";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import { getTestimonials } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "What Our Clients Say",
  description:
    "Real reviews from Oreste Utensils customers — homes, restaurants and hotels across Kigali who trust us for their kitchenware.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const [testimonials, dict] = await Promise.all([
    getTestimonials(),
    getDictionary(),
  ]);

  const reviewJsonLd =
    testimonials.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BUSINESS.name,
          url: SITE_URL,
          review: testimonials.map((t) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.rating,
              bestRating: 5,
            },
            author: { "@type": "Person", name: t.clientName },
            reviewBody: t.quote,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {reviewJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
        />
      )}

      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
          {dict.reviews.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              {dict.common.chatWithUs}
            </a>
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
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
