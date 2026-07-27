"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateSiteImage } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SITE_IMAGE_LABELS, type SiteImageKey } from "@/lib/constants";
import type { SiteImages } from "@/lib/data";

export function SiteImagesManager({ images }: { images: SiteImages }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleUpload(key: SiteImageKey, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusyKey(key);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `site/${key}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setBusyKey(null);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await updateSiteImage(key, data.publicUrl);
    if (!result.ok) {
      setError(result.error);
      setBusyKey(null);
      return;
    }
    setBusyKey(null);
    router.refresh();
  }

  const keys = Object.keys(SITE_IMAGE_LABELS) as SiteImageKey[];

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Site photos</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Swap the big photos on the homepage and About page. Tap a photo to
          upload a new one — it updates the live site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => inputs.current[key]?.click()}
              disabled={busyKey === key}
              className="relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line bg-cream transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
            >
              <Image
                src={images[key]}
                alt={SITE_IMAGE_LABELS[key]}
                fill
                sizes="112px"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[0.6rem] font-medium text-porcelain">
                {busyKey === key ? "Uploading…" : "Change"}
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{SITE_IMAGE_LABELS[key]}</p>
            </div>
            <input
              ref={(el) => {
                inputs.current[key] = el;
              }}
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload(key, event.target.files)}
              className="hidden"
            />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-copper-tint/50 px-4 py-3 text-sm text-copper-deep">
          {error}
        </p>
      )}
    </div>
  );
}
