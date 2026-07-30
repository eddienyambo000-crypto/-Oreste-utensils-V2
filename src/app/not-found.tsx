import Link from "next/link";

/**
 * Root-level 404. The (site) route group has its own branded not-found that
 * renders inside the store chrome; this one catches unknown *top-level* URLs
 * that fall outside every route group, so a mistyped link still lands on a
 * branded page instead of the bare Next.js default.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-6 py-24 text-center">
      <Link
        href="/"
        className="mb-10 flex items-baseline gap-1.5 leading-none"
        aria-label="Oreste Utensils — home"
      >
        <span className="font-display text-2xl font-bold tracking-tight text-ink">
          Oreste
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-copper">
          Utensils
        </span>
      </Link>

      <p className="font-display text-7xl font-bold text-copper">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
        This page could not be found
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
        The link may be out of date. Let&apos;s get you back to the good stuff —
        premium kitchenware at City Plaza, Kigali.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-7 py-3.5 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
        >
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
