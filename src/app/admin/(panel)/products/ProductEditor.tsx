"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { IconArrowRight, IconCamera, IconClose, IconExternal, IconGrid, IconTrash } from "@/components/ui/icons";
import { formatRwf } from "@/lib/format";
import { compressImage } from "@/lib/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Product } from "@/lib/types";

const MAX_PHOTOS = 8;
const BUCKET = "product-images";

/**
 * A photo slot. Uploads run in parallel but keep the order they were picked
 * in, so the first photo taken stays the main one. `preview` is a local blob
 * URL shown while uploading (and after, so the tile never flashes).
 */
interface Photo {
  key: string;
  status: "uploading" | "done" | "failed";
  url?: string;
  preview?: string;
  file?: File;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
}

function groupDigits(digits: string): string {
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.priceRwf) : "");
  const [description, setDescription] = useState(product?.description || product?.shortDescription || "");
  const [photos, setPhotos] = useState<Photo[]>(
    (product?.images ?? []).map((url) => ({ key: url, url, status: "done" })),
  );
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const [saving, setSaving] = useState<null | "save" | "another">(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dragging, setDragging] = useState(false);

  const uploading = photos.some((p) => p.status === "uploading");
  const failed = photos.some((p) => p.status === "failed");
  const doneUrls = photos.flatMap((p) => (p.status === "done" && p.url ? [p.url] : []));

  // Warn before leaving with unsaved work or photos still uploading.
  useEffect(() => {
    if (!dirty && !uploading) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, uploading]);

  // Free local previews when the editor goes away.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)),
    [],
  );

  function touch() {
    setDirty(true);
    setNotice(null);
  }

  async function upload(photo: Photo) {
    if (!photo.file) return;
    const supabase = createSupabaseBrowserClient();
    const file = await compressImage(photo.file);
    const ext = file.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    setPhotos((current) =>
      current.map((p) => {
        if (p.key !== photo.key) return p;
        if (uploadError) return { ...p, status: "failed" };
        const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        return { ...p, status: "done", url, file: undefined };
      }),
    );
  }

  function addFiles(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, Math.max(0, room));
    if (files.length > accepted.length) {
      setNotice(`A product can have up to ${MAX_PHOTOS} photos — ${files.length - accepted.length} not added.`);
    }
    const added: Photo[] = accepted.map((file) => ({
      key: crypto.randomUUID(),
      status: "uploading",
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((current) => [...current, ...added]);
    setDirty(true);
    setError(null);
    added.forEach((photo) => void upload(photo));
    if (cameraRef.current) cameraRef.current.value = "";
    if (libraryRef.current) libraryRef.current.value = "";
  }

  function retry(photo: Photo) {
    setPhotos((current) => current.map((p) => (p.key === photo.key ? { ...p, status: "uploading" } : p)));
    void upload(photo);
  }

  function removePhoto(photo: Photo) {
    if (photo.preview) URL.revokeObjectURL(photo.preview);
    setPhotos((current) => current.filter((p) => p.key !== photo.key));
    touch();
  }

  function makeMain(photo: Photo) {
    setPhotos((current) => [photo, ...current.filter((p) => p.key !== photo.key)]);
    touch();
  }

  function resetForNext(savedName: string) {
    photos.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    setName("");
    setPrice("");
    setDescription("");
    setPhotos([]);
    setInStock(true);
    setFeatured(false);
    setDirty(false);
    setNotice(`“${savedName}” is live. Add the next one.`);
    topRef.current?.scrollIntoView({ block: "start" });
  }

  async function submit(mode: "save" | "another") {
    setError(null);
    setNotice(null);
    if (uploading) return;
    if (failed) {
      setError("Some photos didn't upload. Tap Retry on them, or remove them.");
      return;
    }
    setSaving(mode);
    const savedName = name.trim();
    const result = await saveProduct({
      id: product?.id,
      name: savedName,
      priceRwf: price,
      description,
      images: doneUrls,
      specs: product?.specs ?? {},
      featured,
      inStock,
    });
    setSaving(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDirty(false);
    if (mode === "another") {
      resetForNext(savedName);
      return;
    }
    router.push(`/admin/products?saved=${encodeURIComponent(savedName)}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Delete “${product.name}”? It disappears from the shop straight away.`)) return;
    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    setDirty(false);
    router.push("/admin/products");
    router.refresh();
  }

  const fieldClass =
    "mt-1.5 min-h-12 w-full rounded-xl border border-line-strong bg-porcelain px-4 text-base text-ink placeholder:text-ink-faint";
  const busy = saving !== null || deleting;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit("save");
      }}
      className="mx-auto max-w-2xl"
    >
      <div ref={topRef} className="scroll-mt-24" />
      <Link
        href="/admin/products"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-copper"
      >
        ← Products
      </Link>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          {isEdit ? "Edit product" : "Add a product"}
        </h1>
        {product && (
          <div className="flex items-center gap-2">
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              View in shop
              <IconExternal className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              aria-label={`Delete ${product.name}`}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft transition-colors duration-200 hover:border-copper-deep hover:text-copper-deep disabled:opacity-60"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm font-medium text-ink">
          {notice}
        </p>
      )}

      {/* Photos */}
      <section
        aria-labelledby="photos-label"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`mt-6 rounded-2xl border bg-surface p-4 sm:p-5 ${dragging ? "border-copper" : "border-line"}`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="photos-label" className="font-medium text-ink">
            Photos
          </h2>
          <span className="text-xs tabular-nums text-ink-faint">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>

        {photos.length > 0 && (
          <ul role="list" className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.key} className="relative aspect-square overflow-hidden rounded-xl border border-line bg-cream">
                {photo.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL)
                  <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                ) : photo.url ? (
                  <Image src={photo.url} alt="" fill sizes="160px" className="object-cover" />
                ) : null}

                {photo.status === "uploading" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/35">
                    <span className="h-7 w-7 rounded-full border-[3px] border-white/40 border-t-white motion-safe:animate-spin" />
                    <span className="sr-only">Uploading</span>
                  </span>
                )}
                {photo.status === "failed" && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/60 p-2 text-center">
                    <span className="text-xs font-medium text-white">Upload failed</span>
                    <button
                      type="button"
                      onClick={() => retry(photo)}
                      className="min-h-9 cursor-pointer rounded-full bg-white px-3 text-xs font-semibold text-ink active:scale-95"
                    >
                      Retry
                    </button>
                  </span>
                )}

                {photo.status === "done" &&
                  (index === 0 ? (
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[0.65rem] font-semibold text-porcelain">
                      Main
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeMain(photo)}
                      className="absolute bottom-1.5 left-1.5 min-h-7 cursor-pointer rounded-md bg-ink/70 px-1.5 text-[0.65rem] font-medium text-porcelain transition-colors duration-150 hover:bg-ink active:scale-95"
                    >
                      Make main
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1 top-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-porcelain active:scale-90"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/75 transition-colors duration-150 hover:bg-copper-deep">
                    <IconClose className="h-4 w-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {photos.length < MAX_PHOTOS && (
          <div className="mt-3 grid grid-cols-2 gap-2.5 pointer-fine:grid-cols-1">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex min-h-14 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink px-3 text-[0.9375rem] font-semibold text-porcelain transition-[background-color,transform] duration-200 hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98] pointer-fine:hidden"
            >
              <IconCamera className="h-5 w-5" />
              Take photo
            </button>
            <button
              type="button"
              onClick={() => libraryRef.current?.click()}
              className="flex min-h-14 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-dashed border-line-strong px-3 text-[0.9375rem] font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98]"
            >
              <IconGrid className="h-5 w-5" />
              <span className="pointer-coarse:hidden">Upload photos or drop them here</span>
              <span className="pointer-fine:hidden">From gallery</span>
            </button>
          </div>
        )}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => addFiles(event.target.files)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
        <input
          ref={libraryRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => addFiles(event.target.files)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          The first photo is the one shoppers see first. Photos are resized automatically — upload
          them straight from the camera.
        </p>
      </section>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Product name
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            enterKeyHint="next"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              touch();
            }}
            className={fieldClass}
            placeholder="e.g. Electric kettle 1.8 L"
          />
        </div>

        <div className="sm:max-w-xs">
          <label htmlFor="price" className="text-sm font-medium text-ink">
            Price
          </label>
          <div className="relative">
            <input
              id="price"
              type="text"
              inputMode="numeric"
              required
              autoComplete="off"
              enterKeyHint="next"
              value={groupDigits(price)}
              onChange={(event) => {
                setPrice(digitsOnly(event.target.value));
                touch();
              }}
              aria-describedby="price-unit"
              className={`${fieldClass} pr-16 tabular-nums`}
              placeholder="25,000"
            />
            <span
              id="price-unit"
              className="pointer-events-none absolute right-4 top-1/2 mt-[3px] -translate-y-1/2 text-sm font-medium text-ink-faint"
            >
              RWF
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Description <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              touch();
            }}
            className={`${fieldClass} resize-y py-3`}
            placeholder="Size, material, what it's good for. Helps customers decide and helps Google find it."
          />
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          <Toggle
            id="in-stock"
            label="In stock"
            hint={inStock ? "Customers can add it to their cart." : "Shown as sold out; customers can ask about it."}
            checked={inStock}
            onChange={(value) => {
              setInStock(value);
              touch();
            }}
          />
          <Toggle
            id="featured"
            label="Show on homepage"
            hint="Starred products fill the homepage row. With none starred, the newest show."
            checked={featured}
            onChange={(value) => {
              setFeatured(value);
              touch();
            }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-copper-tint/60 px-4 py-3 text-sm font-medium text-copper-deep">
          {error}
        </p>
      )}

      {/* Sticks to the bottom of the screen while scrolling a long form. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-line bg-porcelain/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:mx-0 sm:rounded-t-2xl sm:px-0">
        {price && !error && (
          <p className="mb-2 text-center text-xs text-ink-faint sm:text-left">
            Shows in the shop as <span className="font-semibold text-ink">{formatRwf(Number(price))}</span>
            {photos.length === 0 && " · no photo yet"}
          </p>
        )}
        <div className="flex gap-2.5">
          {!isEdit && (
            <button
              type="button"
              onClick={() => void submit("another")}
              disabled={busy || uploading}
              className="min-h-12 flex-1 cursor-pointer rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:border-copper hover:text-copper disabled:cursor-wait disabled:opacity-60"
            >
              {saving === "another" ? "Saving…" : "Save & add another"}
            </button>
          )}
          <button
            type="submit"
            disabled={busy || uploading}
            className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-5 font-semibold text-on-copper shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {uploading ? "Uploading photos…" : saving === "save" ? "Saving…" : isEdit ? "Save changes" : "Save product"}
            {!uploading && saving === null && <IconArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <span id={`${id}-label`} className="block font-medium text-ink">
          {label}
        </span>
        <span id={`${id}-hint`} className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
          {hint}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
          checked ? "bg-sage" : "bg-line-strong"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
