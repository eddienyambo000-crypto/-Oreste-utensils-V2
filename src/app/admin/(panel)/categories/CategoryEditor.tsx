"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconTrash } from "@/components/ui/icons";
import type { Category } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryEditor({ category }: { category?: Category }) {
  const router = useRouter();
  const isEdit = Boolean(category);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(category?.description ?? "");
  const [intro, setIntro] = useState(category?.intro ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? "10"));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `brand/category-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImage(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveCategory({
      id: category?.id,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      intro: intro.trim(),
      image,
      sortOrder: Number(sortOrder),
    });
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  async function handleDelete() {
    if (!category) return;
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setDeleting(true);
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          {isEdit ? "Edit category" : "New category"}
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

      <div className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {/* Image */}
        <div>
          <span className="text-sm font-medium text-ink">Tile image</span>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-cream">
              {image && (
                <Image src={image} alt="" fill sizes="112px" className="object-cover" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="cursor-pointer rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper disabled:opacity-60"
            >
              {uploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files)}
            className="hidden"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              className={fieldClass}
              placeholder="e.g. Bakeware"
            />
          </div>
          <div>
            <label htmlFor="sortOrder" className="text-sm font-medium text-ink">
              Sort order
            </label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className={`${fieldClass} tabular-nums`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium text-ink">
            URL slug
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className={`${fieldClass} font-mono text-sm`}
            placeholder="bakeware"
          />
          <p className="mt-1 text-xs text-ink-faint">Lives at /shop/{slug || "…"}</p>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-ink">
            Short description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={fieldClass}
            placeholder="One line shown on the category tile."
          />
        </div>

        <div>
          <label htmlFor="intro" className="text-sm font-medium text-ink">
            Intro paragraph <span className="text-ink-faint">(SEO)</span>
          </label>
          <textarea
            id="intro"
            rows={3}
            value={intro}
            onChange={(event) => setIntro(event.target.value)}
            className={`${fieldClass} resize-y`}
            placeholder="Crawlable intro shown at the top of the category page."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-copper-tint/50 px-4 py-3 text-sm text-copper-deep">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="cursor-pointer rounded-full bg-copper px-6 py-3 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
      </button>
    </form>
  );
}
