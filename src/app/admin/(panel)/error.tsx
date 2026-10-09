"use client";

import Link from "next/link";

/** Error boundary for the admin panel — keeps a crash contained + recoverable. */
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        An error occurred loading this page. Try again, or head back to the
        dashboard.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-full bg-copper px-6 py-2.5 text-sm font-semibold text-on-copper transition-colors duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="cursor-pointer rounded-full border border-line-strong bg-surface px-6 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
