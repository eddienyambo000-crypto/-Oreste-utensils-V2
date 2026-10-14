"use client";

import { useState } from "react";
import { updateGoogleReviewUrl } from "@/app/admin/actions";
import { IconDownload, IconExternal } from "@/components/ui/icons";
import { isGoogleReviewUrl } from "@/lib/reviews";

const DOWNLOADS = [
  { href: "/print/oreste-review-card-a6.pdf", label: "Counter card (A6 PDF)" },
  { href: "/print/oreste-review-cards-a4.pdf", label: "4 cards on A4 (PDF)" },
  { href: "/print/oreste-review-square.png", label: "WhatsApp / Instagram image" },
  { href: "/print/oreste-review-qr.svg", label: "QR only (SVG, for printers)" },
];

/**
 * The Google review QR. Printed cards point at /review on this site, which
 * forwards to the link saved here, so the cards keep working if it changes.
 */
export function ReviewLinkManager({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const trimmed = url.trim();
  const invalid = trimmed !== "" && !isGoogleReviewUrl(trimmed);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateGoogleReviewUrl(trimmed);
    setMessage(
      result.ok
        ? { ok: true, text: trimmed ? "Saved. The QR code now opens your Google review form." : "Cleared. The QR code opens your Google Maps listing." }
        : { ok: false, text: result.error },
    );
    setSaving(false);
  }

  return (
    <section aria-labelledby="reviews-qr" className="rounded-2xl border border-line bg-surface p-6">
      <h2 id="reviews-qr" className="font-display text-lg font-semibold">
        Google reviews QR code
      </h2>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-soft">
        Customers scan the card at the counter and land on your Google review form. The code
        points to <span className="font-medium text-ink">oresteutensils.com/review</span>, so
        printed cards keep working even if the link below changes.
      </p>

      <form onSubmit={save} className="mt-5 max-w-xl">
        <label htmlFor="review-url" className="text-sm font-medium text-ink">
          Your Google review link
        </label>
        <input
          id="review-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://g.page/r/…/review"
          aria-invalid={invalid}
          aria-describedby="review-url-help"
          className="mt-1.5 min-h-12 w-full rounded-xl border border-line-strong bg-porcelain px-4 text-base text-ink placeholder:text-ink-faint"
        />
        <p id="review-url-help" className="mt-2 text-sm leading-relaxed text-ink-soft">
          {invalid
            ? "That doesn't look like a Google link. It should start with https://g.page/ or https://search.google.com/."
            : "In Google Business Profile (signed in as the shop), tap “Ask for reviews” and copy the link. Until it's saved, the code opens your Google Maps listing."}
        </p>

        {message && (
          <p
            role="status"
            className={`mt-3 rounded-xl px-4 py-3 text-sm ${
              message.ok ? "bg-sage/12 text-sage" : "bg-copper-tint/50 text-copper-deep"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || invalid}
            className="min-h-11 cursor-pointer rounded-full bg-copper px-6 text-sm font-semibold text-on-copper shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save link"}
          </button>
          <a
            href="/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            Test the QR link
            <IconExternal className="h-4 w-4" />
          </a>
        </div>
      </form>

      <h3 className="mt-7 text-sm font-semibold text-ink">Print and share</h3>
      <ul role="list" className="mt-3 grid gap-2 sm:grid-cols-2">
        {DOWNLOADS.map((file) => (
          <li key={file.href}>
            <a
              href={file.href}
              download
              className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              <IconDownload className="h-4 w-4 shrink-0 text-copper" />
              {file.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
