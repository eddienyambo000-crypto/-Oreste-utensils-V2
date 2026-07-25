"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { updateLogoUrl } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconClose, IconPlus } from "@/components/ui/icons";

export function LogoManager({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `brand/logo-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setMessage({ ok: false, text: `Upload failed: ${uploadError.message}` });
      setBusy(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await updateLogoUrl(data.publicUrl);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      setBusy(false);
      return;
    }
    setLogoUrl(data.publicUrl);
    setMessage({ ok: true, text: "Logo saved. It now shows in the nav and footer." });
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemove() {
    setBusy(true);
    setMessage(null);
    const result = await updateLogoUrl(null);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      setBusy(false);
      return;
    }
    setLogoUrl(null);
    setMessage({ ok: true, text: "Logo removed. The text wordmark is back." });
    setBusy(false);
  }

  return (
    <div className="max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Brand logo</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Upload a logo to replace the &ldquo;Oreste&rdquo; text in the nav and
          footer. Use a transparent PNG or SVG for the cleanest look.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Current logo"
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="font-display text-xl font-bold text-ink">O</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            <IconPlus className="h-4 w-4" />
            {busy ? "Working…" : logoUrl ? "Replace logo" : "Upload logo"}
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-copper-deep hover:text-copper-deep disabled:opacity-60"
            >
              <IconClose className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/webp,image/jpeg"
        onChange={(event) => handleFile(event.target.files)}
        className="hidden"
      />

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
    </div>
  );
}
