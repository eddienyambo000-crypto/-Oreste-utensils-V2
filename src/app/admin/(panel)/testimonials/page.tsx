import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getTestimonials } from "@/lib/data";
import { IconPlus } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const testimonials = await getTestimonials();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Testimonials <span className="text-ink-faint">({testimonials.length})</span>
        </h1>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          <IconPlus className="h-4 w-4" />
          New testimonial
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No testimonials yet. Add what happy clients say — with their photo — to
          build trust on the site.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {testimonials.map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/testimonials/${t.id}`}
                className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-cream/50"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cream">
                  {t.photo && (
                    <Image src={t.photo} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">
                    {t.clientName}
                    {t.business ? (
                      <span className="text-ink-faint"> — {t.business}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-sm text-ink-soft">
                    &ldquo;{t.quote}&rdquo;
                  </span>
                </span>
                <span className="shrink-0 text-sm text-copper" aria-label={`${t.rating} stars`}>
                  {"★".repeat(t.rating)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
