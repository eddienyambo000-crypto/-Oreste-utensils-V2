import { formatRwf } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AnnouncementBar({
  threshold,
  dict,
}: {
  threshold: number;
  dict: Dictionary;
}) {
  return (
    <div className="bg-ink px-4 py-2 text-center">
      <p className="text-xs font-medium tracking-wide text-porcelain sm:text-sm">
        {dict.announcement.pre}{" "}
        <span className="text-copper-tint">{formatRwf(threshold)}</span>
        <span className="hidden sm:inline"> · {dict.announcement.note}</span>
      </p>
    </div>
  );
}
