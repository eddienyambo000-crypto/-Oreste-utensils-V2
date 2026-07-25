"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the server logs in production.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">
        Something went wrong
      </h1>
      <p className="mt-3 text-ink-soft">
        That&apos;s on us, not you. Try again, or reach us on WhatsApp and we&apos;ll
        sort it out.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}
