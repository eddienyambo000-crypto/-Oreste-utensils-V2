"use client";

import { DELIVERY, FREE_DELIVERY_THRESHOLD_RWF } from "@/lib/constants";
import { formatRwf } from "@/lib/format";
import { IconStore, IconTruck } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Delivery zones + indicative fees. Answers the single biggest checkout
 * hesitation — "what will delivery cost me?" — before it's asked. Fees are
 * indicative and confirmed on WhatsApp by exact location.
 */
export function DeliveryZones() {
  const { dict } = useLang();
  const t = dict.delivery;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-copper-tint/40 px-5 py-3.5">
        <IconTruck className="h-5 w-5 text-copper" />
        <p className="text-sm font-semibold text-ink">
          {t.freeBannerPre} {formatRwf(FREE_DELIVERY_THRESHOLD_RWF)}
        </p>
        <span className="text-sm text-ink-soft">{t.freeBannerPost}</span>
      </div>

      <ul className="divide-y divide-line">
        {DELIVERY.zones.map((zone) => (
          <li
            key={zone.area}
            className="flex items-center justify-between gap-4 px-5 py-3"
          >
            <span className="text-sm text-ink-soft">{zone.area}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
              {dict.common.from} {formatRwf(zone.fee)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-3 border-t border-line bg-cream/50 px-5 py-3.5">
        <IconStore className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
        <p className="text-sm text-ink-soft">
          {t.pickupPre} <span className="font-medium text-ink">{t.pickupBold}</span>{" "}
          {t.pickupPost}
        </p>
      </div>
    </div>
  );
}
