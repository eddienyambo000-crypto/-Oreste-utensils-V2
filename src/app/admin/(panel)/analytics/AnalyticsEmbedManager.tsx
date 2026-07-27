"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAnalyticsEmbedUrl } from "@/app/admin/actions";
import { IconChart, IconExternal } from "@/components/ui/icons";

export function AnalyticsEmbedManager({ initialUrl }: { initialUrl: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: string) {
    setSaving(true);
    setError(null);
    const result = await updateAnalyticsEmbedUrl(next);
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper-tint text-copper">
          <IconChart className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold">
            Show behaviour metrics right here
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Build a free <span className="font-medium text-ink">Looker Studio</span> report on
            your Google Analytics data, click <span className="font-medium text-ink">Share →
            Embed report</span>, and paste the embed link below. It&apos;ll then load right on
            this page — no need to leave the admin.
          </p>
          <a
            href="https://lookerstudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
          >
            Open Looker Studio
            <IconExternal className="h-3.5 w-3.5" />
          </a>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://lookerstudio.google.com/embed/reporting/…"
              className="min-w-0 flex-1 rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint"
            />
            <button
              type="button"
              onClick={() => save(url)}
              disabled={saving}
              className="cursor-pointer rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save dashboard"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-copper-deep">{error}</p>}
          {initialUrl && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                save("");
              }}
              disabled={saving}
              className="mt-3 cursor-pointer text-xs text-ink-faint underline underline-offset-2 hover:text-copper-deep"
            >
              Remove embedded dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
