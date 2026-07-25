import { formatRwf } from "@/lib/format";

export function AnnouncementBar({ threshold }: { threshold: number }) {
  return (
    <div className="bg-ink px-4 py-2 text-center">
      <p className="text-xs font-medium tracking-wide text-porcelain sm:text-sm">
        Free delivery across Kigali on orders over{" "}
        <span className="text-copper-tint">{formatRwf(threshold)}</span>
        <span className="hidden sm:inline"> · Pay cash or MoMo on delivery</span>
      </p>
    </div>
  );
}
