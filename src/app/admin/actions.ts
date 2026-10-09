"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { SITE_IMAGE_KEYS } from "@/lib/constants";
import { CATALOG_TAG } from "@/lib/data";
import { slugOrFallback, summarize } from "@/lib/slug";
import { storagePathsIn } from "@/lib/storage";
import type { LeadStatus, MessageStatus, OrderStatus } from "@/lib/types";

// Server actions are public endpoints: every argument is validated here, even
// when the admin UI only ever sends well-formed values.

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];
const MESSAGE_STATUSES: MessageStatus[] = ["new", "read", "replied"];

const PRODUCT_IMAGES_BUCKET = "product-images";
const NOT_CONNECTED = { ok: false, error: "Supabase is not connected." } as const;
const idSchema = z.string().uuid();

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SaveProductResult = { ok: true; slug: string } | { ok: false; error: string };

/**
 * The database still requires every product to reference a category (kept so
 * grouping can come back later without a migration). The shop never asks for
 * one: every product lives in this single internal category, created
 * automatically the first time it is needed.
 */
const CATALOGUE_CATEGORY = { slug: "all-products", name: "All products" } as const;

// The slug is derived on the server from the name when a product is created,
// and never changed afterwards (it is the product's public link).
const productSchema = z.object({
  id: idSchema.optional(),
  name: z
    .string()
    .trim()
    .min(2, "Enter the product name.")
    .max(200, "Keep the name under 200 characters."),
  priceRwf: z.coerce
    .number({ error: "Enter the price in RWF (numbers only)." })
    .int("Enter the price in whole RWF.")
    .positive("Enter the price in RWF.")
    .max(100_000_000, "That price looks too high — check the zeros."),
  // Optional: a photo, a name and a price are enough to list a product.
  description: z.string().trim().max(2000, "Keep the description under 2,000 characters."),
  images: z
    .array(z.string().url().or(z.string().startsWith("/")))
    .max(8, "Up to 8 photos per product."),
  specs: z.record(z.string(), z.string()),
  featured: z.boolean(),
  inStock: z.boolean(),
});

export type ProductFormInput = z.input<typeof productSchema>;

function productSaveError(error: { code?: string; message: string }): SaveProductResult {
  if (error.code === "PGRST116") {
    return { ok: false, error: "This product was deleted in the meantime." };
  }
  return { ok: false, error: `Couldn't save: ${error.message}` };
}

export async function saveProduct(input: ProductFormInput): Promise<SaveProductResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the product details." };
  }
  const data = parsed.data;

  const row = {
    name: data.name,
    price_rwf: data.priceRwf,
    // One description field in the admin; the short form (search snippets,
    // social previews) is derived so the two can never disagree.
    short_description: summarize(data.description, 300),
    description: data.description,
    images: data.images,
    specs: data.specs,
    featured: data.featured,
    in_stock: data.inStock,
  };

  let slug: string | undefined;
  if (data.id) {
    const { data: updated, error } = await supabase
      .from("ou_products")
      .update(row)
      .eq("id", data.id)
      .select("slug")
      .single();
    if (error) return productSaveError(error);
    slug = updated.slug as string;
  } else {
    // Two products may share a name ("Glass"); the second gets a short
    // suffix instead of failing on the unique slug.
    const base = slugOrFallback(data.name, "product");
    let candidate = base;
    let categoryEnsured = false;
    for (let attempt = 0; attempt < 6 && !slug; attempt++) {
      const { error } = await supabase
        .from("ou_products")
        .insert({ ...row, slug: candidate, category_slug: CATALOGUE_CATEGORY.slug });
      if (!error) {
        slug = candidate;
      } else if (error.code === "23503" && !categoryEnsured) {
        const { error: categoryError } = await supabase
          .from("ou_categories")
          .upsert(CATALOGUE_CATEGORY, { onConflict: "slug", ignoreDuplicates: true });
        if (categoryError) return productSaveError(categoryError);
        categoryEnsured = true;
      } else if (error.code === "23505") {
        candidate = `${base}-${crypto.randomUUID().slice(0, 4)}`;
      } else {
        return productSaveError(error);
      }
    }
    if (!slug) return { ok: false, error: "Couldn't save the product. Please try again." };
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  return { ok: true, slug };
}

/** Deletes a product and, best-effort, its photos from storage. */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid product." };

  const { data: deleted, error } = await supabase
    .from("ou_products")
    .delete()
    .eq("id", id)
    .select("images")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  const paths = storagePathsIn((deleted?.images as string[] | null) ?? [], PRODUCT_IMAGES_BUCKET);
  if (paths.length > 0) {
    // A leftover file is harmless; never fail the delete over it.
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  return { ok: true };
}

const productFlagsSchema = z
  .object({
    id: idSchema,
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
  })
  .refine((v) => v.inStock !== undefined || v.featured !== undefined, "Nothing to update.");

/**
 * One-tap toggles from the product list (in stock / show on homepage) so the
 * shop can be kept current from a phone without opening the full editor.
 */
export async function setProductFlags(input: {
  id: string;
  inStock?: boolean;
  featured?: boolean;
}): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsed = productFlagsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid update." };
  }
  const { id, inStock, featured } = parsed.data;
  const patch: { in_stock?: boolean; featured?: boolean } = {};
  if (inStock !== undefined) patch.in_stock = inStock;
  if (featured !== undefined) patch.featured = featured;

  const { error } = await supabase.from("ou_products").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  return { ok: true };
}

const testimonialSchema = z.object({
  id: idSchema.optional(),
  clientName: z.string().trim().min(2).max(120),
  business: z.string().trim().max(160).nullable(),
  quote: z.string().trim().min(2).max(1000),
  photo: z.string().url().or(z.string().startsWith("/")).nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type TestimonialFormInput = z.input<typeof testimonialSchema>;

export async function saveTestimonial(input: TestimonialFormInput): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid testimonial." };
  }
  const data = parsed.data;
  const row = {
    client_name: data.clientName,
    business: data.business,
    quote: data.quote,
    photo: data.photo,
    rating: data.rating,
    sort_order: data.sortOrder,
  };
  const query = data.id
    ? supabase.from("ou_testimonials").update(row).eq("id", data.id)
    : supabase.from("ou_testimonials").insert(row);
  const { error } = await query;
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid review." };
  const { error } = await supabase.from("ou_testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  if (!idSchema.safeParse(id).success || !LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase.from("ou_leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function updateMessageStatus(id: string, status: MessageStatus): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  if (!idSchema.safeParse(id).success || !MESSAGE_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase.from("ou_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  if (!idSchema.safeParse(id).success || !ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase.from("ou_orders").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true };
}

const thresholdSchema = z.coerce
  .number({ error: "Enter an amount in RWF." })
  .int("Enter a whole amount in RWF.")
  .min(0, "The amount can't be negative.")
  .max(100_000_000, "That amount looks too high — check the zeros.");

export async function updateFreeDeliveryThreshold(value: number): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsed = thresholdSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid amount." };
  }
  const { error } = await supabase.from("ou_settings").upsert({
    key: "free_delivery_threshold_rwf",
    value: String(parsed.data),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

const logoUrlSchema = z.string().trim().max(500).url().startsWith("https://").nullable();

// Only allow embedding trusted Google dashboard hosts in the admin iframe.
const analyticsEmbedSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (value) => value === "" || /^https:\/\/(lookerstudio|datastudio)\.google\.com\/embed\//.test(value),
    "Paste the Looker Studio EMBED url (lookerstudio.google.com/embed/…).",
  );

/** Sets or clears the Looker Studio dashboard embedded on the Analytics page. */
export async function updateAnalyticsEmbedUrl(url: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsed = analyticsEmbedSchema.safeParse(url);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid URL." };
  }
  const { error } = await supabase.from("ou_settings").upsert({
    key: "analytics_embed_url",
    value: parsed.data,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/analytics");
  return { ok: true };
}

const siteImageKeySchema = z.enum(Object.keys(SITE_IMAGE_KEYS) as [string, ...string[]]);
const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\//.test(v) || v.startsWith("/"), "Invalid image URL.");

/** Sets or resets ("") one editable site photo. */
export async function updateSiteImage(key: string, url: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsedKey = siteImageKeySchema.safeParse(key);
  const parsedUrl = imageUrlSchema.safeParse(url);
  if (!parsedKey.success || !parsedUrl.success) {
    return { ok: false, error: "Invalid image." };
  }
  const { error } = await supabase
    .from("ou_settings")
    .upsert({ key: parsedKey.data, value: parsedUrl.data });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Sets or clears (null) the brand logo shown in the nav and footer. */
export async function updateLogoUrl(url: string | null): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) return NOT_CONNECTED;
  const parsed = logoUrlSchema.safeParse(url);
  if (!parsed.success) {
    return { ok: false, error: "Invalid logo URL." };
  }
  const { error } = await supabase.from("ou_settings").upsert({
    key: "logo_url",
    value: parsed.data ?? "",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}
