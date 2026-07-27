import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialCard } from "@/components/shop/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { IconArrowRight, IconWhatsApp } from "@/components/ui/icons";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import { getTestimonials } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "What Our Clients Say",
  description:
    "Real reviews from Oreste Utensils customers — homes, restaurants and hotels across Kigali who trust us for their kitchenware.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

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
          What our clients say
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
          Kigali kitchens we&apos;ve kitted out.
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          From family kitchens to busy restaurant lines, here&apos;s what people say
          after ordering from Oreste Utensils.
        </p>
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
          <p className="text-ink-soft">
            Fresh reviews are on the way. In the meantime, come see us or say hello.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink("Hello Oreste Utensils!")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-medium text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              Chat with us
            </a>
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              Browse the shop
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
