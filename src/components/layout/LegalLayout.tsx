import type { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

/** Shared shell for the privacy and terms pages. */
export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-ink-faint">Last updated {updated}</p>
      </header>
      <div className="mt-10 space-y-8 leading-relaxed text-ink-soft [&_a]:text-copper [&_a:hover]:text-copper-deep [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3">
        {children}
      </div>
    </div>
  );
}
