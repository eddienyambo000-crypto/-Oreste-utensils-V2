"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconClose, IconPlus, IconTrash } from "@/components/ui/icons";
import type { Product } from "@/lib/types";

interface CategoryOption {
  slug: string;
  name: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductEditor({
  product,
  categories,
}: {
  product?: Product;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categorySlug, setCategorySlug] = useState<string>(
    product?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [priceRwf, setPriceRwf] = useState(String(product?.priceRwf ?? ""));
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? "",
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [inStock, setInStock] = useState(product?.inStock ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    // Keep the URL in sync with the name for new products; never change an
    // existing product's slug (it would break its live link and SEO).
    if (!isEdit) setSlug(slugify(value));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${slug || slugify(name) || "product"}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    setImages((prev) => [...prev, ...uploaded].slice(0, 8));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((image) => image !== url));
  }

  function setMainImage(url: string) {
    setImages((prev) => [url, ...prev.filter((image) => image !== url)]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const finalSlug = (isEdit ? slug : slugify(name)).trim() || slugify(name);
    const shortText = shortDescription.trim();

    const result = await saveProduct({
      id: product?.id,
      name: name.trim(),
      slug: finalSlug,
      categorySlug,
      priceRwf: Number(priceRwf),
      shortDescription: shortText,
      // The product page reuses the same description — no second long field.
      description: product?.description?.trim() || shortText,
      images,
      specs: product?.specs ?? {},
      featured,
      inStock,
    });

    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          {isEdit ? "Edit product" : "New product"}
        </h1>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-copper-deep hover:text-copper-deep disabled:opacity-60"
          >
            <IconTrash className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Images */}
          <div className="rounded-2xl border border-line bg-surface p-5">
            <span className="text-sm font-medium text-ink">Images</span>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {images.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-xl border border-line bg-cream"
                >
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                  {index === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-copper px-1.5 py-0.5 text-[0.6rem] font-semibold text-white shadow-sm">
                      Main
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMainImage(url)}
                      className="absolute bottom-1.5 left-1.5 cursor-pointer rounded-md bg-ink/75 px-1.5 py-0.5 text-[0.6rem] font-medium text-porcelain backdrop-blur-sm transition-colors duration-150 hover:bg-ink active:scale-95"
                    >
                      Set main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-ink/75 text-porcelain shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-copper-deep active:scale-90"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line-strong text-ink-faint transition-colors duration-200 hover:border-copper hover:bg-copper-tint/20 hover:text-copper disabled:opacity-60"
                >
                  <IconPlus className="h-6 w-6" />
                  <span className="text-xs font-medium">{uploading ? "Uploading…" : "Add photo"}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleFiles(event.target.files)}
              className="hidden"
            />
            <p className="mt-3 text-xs text-ink-faint">
              Tap <span className="font-medium text-ink-soft">Add photo</span> to upload (up
              to 8). The <span className="font-medium text-ink-soft">Main</span> photo shows
              first — tap &ldquo;Set main&rdquo; on any other to promote it. Tap the ✕ to
              remove.
            </p>
          </div>

          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Product name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              className={fieldClass}
              placeholder="e.g. Ember Enamelled Dutch Oven — 5.2 L"
            />
          </div>

          <div>
            <label htmlFor="short" className="text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="short"
              required
              rows={3}
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              className={`${fieldClass} resize-y`}
              placeholder="A line or two about this item — what it is and why it's good. Shows on the shop and helps Google find it."
            />
            <p className="mt-1 text-xs text-ink-faint">
              Keep it short. This is all customers and search engines need.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-5 rounded-2xl border border-line bg-surface p-5">
            <div>
              <label htmlFor="category" className="text-sm font-medium text-ink">
                Category
              </label>
              <select
                id="category"
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                className={`${fieldClass} cursor-pointer`}
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="text-sm font-medium text-ink">
                Price (RWF)
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step={500}
                required
                value={priceRwf}
                onChange={(event) => setPriceRwf(event.target.value)}
                className={`${fieldClass} tabular-nums`}
                placeholder="145000"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">In stock</span>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
                className="h-5 w-5 cursor-pointer accent-copper"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">Featured on homepage</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="h-5 w-5 cursor-pointer accent-copper"
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-copper-tint/50 px-4 py-3 text-sm text-copper-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full cursor-pointer rounded-full bg-copper px-6 py-3 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}
