"use client";

import { useState } from "react";
import { updateFreeDeliveryThreshold } from "@/app/admin/actions";
import { formatRwf } from "@/lib/format";

export function SettingsForm({ initialThreshold }: { initialThreshold: number }) {
  const [threshold, setThreshold] = useState(String(initialThreshold));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateFreeDeliveryThreshold(Number(threshold));
    setMessage(
      result.ok
        ? { ok: true, text: "Saved. The storefront now uses the new threshold." }
        : { ok: false, text: result.error },
    );
    setSaving(false);
  }

  const preview = Number(threshold);

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5 rounded-2xl border border-line bg-surface p-6">
      <div>
        <label htmlFor="threshold" className="text-sm font-medium text-ink">
          Free delivery threshold (RWF)
        </label>
        <input
          id="threshold"
          type="number"
          min={0}
          step={10000}
          required
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 tabular-nums text-ink"
        />
        <p className="mt-2 text-sm text-ink-soft">
          Orders at or above{" "}
          <span className="font-medium text-ink">
            {Number.isFinite(preview) ? formatRwf(preview) : "—"}
          </span>{" "}
          get free delivery across Kigali. Shown in the announcement bar, cart meter
          and checkout.
        </p>
      </div>

      {message && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${
            message.ok ? "bg-sage/12 text-sage" : "bg-copper-tint/50 text-copper-deep"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer rounded-full bg-copper px-6 py-2.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {saving ? "Saving…" : "Save threshold"}
      </button>
    </form>
  );
}
