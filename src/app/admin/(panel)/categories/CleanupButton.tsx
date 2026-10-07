"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteEmptyCategories } from "@/app/admin/actions";

/** Removes empty, photo-less category labels in one go, after a confirm. */
export function CleanupButton({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    const ok = window.confirm(
      `Remove ${count} empty categor${count === 1 ? "y" : "ies"}? They have no products and no cover photo. Products are never touched.`,
    );
    if (!ok) return;
    setBusy(true);
    setMessage(null);
    const result = await deleteEmptyCategories();
    setBusy(false);
    if (!result.ok) {
      setMessage(`Couldn't remove them: ${result.error}`);
      return;
    }
    setMessage(`Removed ${result.removed}.`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="min-h-11 cursor-pointer rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper-deep hover:text-copper-deep disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Removing…" : `Remove ${count} empty`}
      </button>
      {message && (
        <span role="status" className="text-sm text-ink-soft">
          {message}
        </span>
      )}
    </div>
  );
}
