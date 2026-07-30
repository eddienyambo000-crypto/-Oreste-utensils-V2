"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateMarqueeSlides } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { MarqueeSlide } from "@/lib/types";

/**
 * Curates the homepage scrolling strip. The client uploads exact photos,
 * optionally captions and links them, reorders, and saves. An empty list means
 * the strip falls back to showing the latest products automatically.
 */
export function MarqueeManager({
  initialSlides,
}: {
  initialSlides: MarqueeSlide[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [slides, setSlides] = useState<MarqueeSlide[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setSaved(false);
    setError(null);
  }

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    markDirty();
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `marquee/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setSlides((prev) => [...prev, { url: data.publicUrl, name: "", price: 0, link: "" }]);
    setUploading(false);
  }

  function updateSlide(index: number, patch: Partial<MarqueeSlide>) {
    setSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
    markDirty();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  }

  function remove(index: number) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateMarqueeSlides(
      slides.map((s) => ({
        url: s.url,
        name: s.name ?? "",
        price: s.price ?? 0,
        link: s.link ?? "",
      })),
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-lg font-semibold">
          Homepage slider photos
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Pick the exact photos that scroll across the top of the homepage, and
          give each one a <strong>product name</strong> and <strong>price</strong> so
          they show on the slide. Add a link if you want it to open a page when
          tapped. Remember to <strong>Save changes</strong>. (If you leave this
          empty, the strip shows your latest products — but only once you have
          products with photos, so add slides here to fill it now.)
        </p>
      </div>

      {slides.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-cream/60 px-4 py-6 text-center text-sm text-ink-soft">
          No slider photos yet — the strip on the homepage is empty until you add
          some here (or add products with photos). Tap <strong>+ Add photo</strong> to start.
        </p>
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, index) => (
            <li
              key={slide.url + index}
              className="flex flex-col gap-3 rounded-xl border border-line bg-cream/40 p-3 sm:flex-row sm:items-start"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-cream">
                <Image
                  src={slide.url}
                  alt={slide.name || `Slide ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={slide.name ?? ""}
                    onChange={(e) => updateSlide(index, { name: e.target.value })}
                    placeholder="Product name"
                    maxLength={120}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-copper sm:flex-1"
                  />
                  <div className="relative sm:w-40">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={slide.price ? String(slide.price) : ""}
                      onChange={(e) =>
                        updateSlide(index, { price: Number(e.target.value) || 0 })
                      }
                      placeholder="Price"
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 pr-12 text-sm text-ink outline-none focus-visible:border-copper"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-ink-soft">
                      RWF
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  value={slide.link ?? ""}
                  onChange={(e) => updateSlide(index, { link: e.target.value })}
                  placeholder="Link when tapped, e.g. /shop or /product/… (optional)"
                  maxLength={500}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-copper"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="cursor-pointer rounded-lg border border-line px-2.5 py-1 text-sm text-ink transition-colors duration-200 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === slides.length - 1}
                  aria-label="Move down"
                  className="cursor-pointer rounded-lg border border-line px-2.5 py-1 text-sm text-ink transition-colors duration-200 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove slide"
                  className="cursor-pointer rounded-lg border border-line px-2.5 py-1 text-sm text-copper-deep transition-colors duration-200 hover:bg-copper-tint/50"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="cursor-pointer rounded-full border border-copper px-5 py-2.5 text-sm font-medium text-copper transition-colors duration-200 hover:bg-copper-tint/40 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "+ Add photo"}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="cursor-pointer rounded-full bg-copper px-6 py-2.5 text-sm font-semibold text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-copper-deep">Saved ✓</span>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-copper-tint/50 px-4 py-3 text-sm text-copper-deep"
        >
          {error}
        </p>
      )}
    </div>
  );
}
