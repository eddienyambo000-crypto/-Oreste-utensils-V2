import Link from "next/link";
import { IconStore, IconWhatsApp } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { whatsappLink } from "@/lib/whatsapp";

type NoticeKind = { kind: "empty" } | { kind: "unavailable"; retryHref: string };

/**
 * Honest catalogue states. "Empty" (nothing listed yet) and "unavailable"
 * (the database could not be reached) are deliberately different messages: a
 * connection failure is never dressed up as an empty shop, and both offer a
 * way forward. Spacing is the caller's.
 */
export function CatalogNotice({ dict, ...notice }: NoticeKind & { dict: Dictionary }) {
  const t = dict.catalog;
  const unavailable = notice.kind === "unavailable";

  return (
    <div
      role={unavailable ? "alert" : "status"}
      className="rounded-3xl border border-line bg-surface px-6 py-12 text-center sm:px-10"
    >
      <h2 className="mx-auto max-w-md font-display text-2xl font-semibold tracking-[-0.01em] text-balance">
        {unavailable ? t.unavailableTitle : t.emptyTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
        {unavailable ? t.unavailableBody : t.emptyBody}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {notice.kind === "unavailable" && (
          <a
            href={notice.retryHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-porcelain transition-colors duration-200 hover:bg-ink/85"
          >
            {t.retry}
          </a>
        )}
        <a
          href={whatsappLink("Hello Oreste Utensils! What do you have in store at the moment?")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-on-copper transition-colors duration-200 hover:bg-copper-deep"
        >
          <IconWhatsApp aria-hidden className="h-4 w-4" />
          {t.askWhatsapp}
        </a>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
        >
          <IconStore aria-hidden className="h-4 w-4" />
          {dict.common.visitStore}
        </Link>
      </div>
    </div>
  );
}
