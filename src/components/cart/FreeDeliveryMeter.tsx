"use client";

import { formatRwf } from "@/lib/format";
import { IconCheck, IconTruck } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n/LanguageProvider";

interface FreeDeliveryMeterProps {
  subtotal: number;
  threshold: number;
}

export function FreeDeliveryMeter({ subtotal, threshold }: FreeDeliveryMeterProps) {
  const { dict } = useLang();
  const reached = subtotal >= threshold;
  const progress = Math.min(subtotal / threshold, 1);
  const remaining = threshold - subtotal;

  return (
    <div
      className="rounded-xl border border-line bg-cream/60 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm">
        {reached ? (
          <>
            <IconCheck className="h-4 w-4 shrink-0 text-sage" />
            <p className="font-medium text-sage">{dict.cart.meterReached}</p>
          </>
        ) : (
          <>
            <IconTruck className="h-4 w-4 shrink-0 text-copper" />
            <p className="text-ink-soft">
              {dict.cart.meterAddPre}{" "}
              <span className="font-semibold text-ink">{formatRwf(remaining)}</span>{" "}
              {dict.cart.meterAddPost}
            </p>
          </>
        )}
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards free delivery"
      >
        <div
          className={`h-full rounded-full ${reached ? "bg-sage" : "bg-copper"} transition-transform duration-500 origin-left`}
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}
