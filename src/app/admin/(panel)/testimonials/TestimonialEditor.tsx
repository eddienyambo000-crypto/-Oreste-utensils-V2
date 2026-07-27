"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { IconTrash } from "@/components/ui/icons";
import type { Testimonial } from "@/lib/types";

export function TestimonialEditor({ testimonial }: { testimonial?: Testimonial }) {
  const router = useRouter();
  const isEdit = Boolean(testimonial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clientName, setClientName] = useState(testimonial?.clientName ?? "");
  const [business, setBusiness] = useState(testimonial?.business ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [photo, setPhoto] = useState(testimonial?.photo ?? "");
  const [rating, setRating] = useState(String(testimonial?.rating ?? 5));
  const [sortOrder, setSortOrder] = useState(String(testimonial?.sortOrder ?? 10));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `testimonials/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setPhoto(data.publicUrl);
    setUploading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const result = await saveTestimonial({
      id: testimonial?.id,
      clientName: clientName.trim(),
      business: business.trim() || null,
      quote: quote.trim(),
      photo: photo || null,
      rating: Number(rating),
      sortOrder: Number(sortOrder),
    });
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  async function handleDelete() {
    if (!testimonial) return;
    if (!window.confirm("Delete this testimonial?")) return;
    setDeleting(true);
    const result = await deleteTestimonial(testimonial.id);
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/admin/testimonials");
    router.refresh();
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          {isEdit ? "Edit testimonial" : "New testimonial"}
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
        {/* Client photo */}
        <div>
          <span className="text-sm font-medium text-ink">Client photo</span>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-cream">
              {photo && (
                <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="cursor-pointer rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper disabled:opacity-60"
            >
              {uploading ? "Uploading…" : photo ? "Replace photo" : "Upload client photo"}
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
            <label htmlFor="clientName" className="text-sm font-medium text-ink">
              Client name
            </label>
            <input
              id="clientName"
              type="text"
              required
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              className={fieldClass}
              placeholder="e.g. Jean-Paul H."
            />
          </div>
          <div>
            <label htmlFor="business" className="text-sm font-medium text-ink">
              Business / role <span className="text-ink-faint">(optional)</span>
            </label>
            <input
              id="business"
              type="text"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
              className={fieldClass}
              placeholder="e.g. Chef, Hôtel des Mille Collines"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quote" className="text-sm font-medium text-ink">
            What they said
          </label>
          <textarea
            id="quote"
            required
            rows={4}
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            className={`${fieldClass} resize-y`}
            placeholder="Their words about Oreste Utensils…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rating" className="text-sm font-medium text-ink">
              Rating
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className={`${fieldClass} cursor-pointer`}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
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
        {saving ? "Saving…" : isEdit ? "Save changes" : "Add testimonial"}
      </button>
    </form>
  );
}
