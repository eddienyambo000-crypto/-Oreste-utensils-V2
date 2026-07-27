import Image from "next/image";
import type { Testimonial } from "@/lib/types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card">
      <div className="flex gap-0.5 text-copper" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} aria-hidden className={i < testimonial.rating ? "" : "text-line-strong"}>
            ★
          </span>
        ))}
      </div>
      <blockquote className="mt-4 flex-1 leading-relaxed text-ink-soft">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cream">
          {testimonial.photo && (
            <Image
              src={testimonial.photo}
              alt={testimonial.clientName}
              fill
              sizes="44px"
              className="object-cover"
            />
          )}
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">
            {testimonial.clientName}
          </span>
          {testimonial.business && (
            <span className="block text-xs text-ink-faint">{testimonial.business}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
