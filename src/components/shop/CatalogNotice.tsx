import Link from "next/link";
import { IconStore, IconWhatsApp } from "@/components/ui/icons";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { whatsappLink } from "@/lib/whatsapp";

type NoticeKind =
  | { kind: "empty" }
  | { kind: "unavailable"; retryHref: string }
  | { kind: "empty-category"; categoryName: string };

/**
 * Honest catalogue states. "Empty" (nothing listed yet), "unavailable" (the
 * database could not be reached) and "empty-category" are deliberately
 * different messages: a connection failure is never dressed up as an empty
 * shop, and every state offers a way forward.
 */
export function CatalogNotice({ dict, ...notice }: NoticeKind & { dict: Dictionary }) {
  const t = dict.catalog;

  const title =
    notice.kind === "unavailable"
      ? t.unavailableTitle
      : notice.kind === "empty-category"
        ? t.emptyCategoryTitle.replace("{category}", notice.categoryName)
        : t.emptyTitle;
  const body =
    notice.kind === "unavailable"
      ? t.unavailableBody
      : notice.kind === "empty-category"
        ? t.emptyCategoryBody
        : t.emptyBody;
  const message =
    notice.kind === "empty-category"
      ? `Hello Oreste Utensils! What do you have in ${notice.categoryName} at the moment?`
      : "Hello Oreste Utensils! What do you have in store at the moment?";

  return (
    <div
      role={notice.kind === "unavailable" ? "alert" : "status"}
      className="mt-8 rounded-3xl border border-line bg-surface px-6 py-12 text-center sm:px-10"
    >
      <h2 className="mx-auto max-w-md font-display text-2xl font-semibold tracking-[-0.01em] text-balance">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">{body}</p>
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
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-copper-deep"
        >
          <IconWhatsApp className="h-4 w-4" />
          {t.askWhatsapp}
        </a>
        {notice.kind === "empty-category" ? (
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            {dict.common.browseShop}
          </Link>
        ) : (
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
          >
            <IconStore className="h-4 w-4" />
            {dict.common.visitStore}
          </Link>
        )}
      </div>
    </div>
  );
}
