"use server";

import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { SITE_IMAGE_KEYS } from "@/lib/constants";
import { LAST_CATEGORY_COOKIE } from "@/lib/admin/preferences";
import { CATALOG_TAG } from "@/lib/data";
import { slugOrFallback, summarize } from "@/lib/slug";
import type { LeadStatus, MessageStatus, OrderStatus } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

const MESSAGE_STATUSES: MessageStatus[] = ["new", "read", "replied"];

const slugField = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes");

// The slug is derived on the server: from the name when a product is created,
// and never changed afterwards (it is the product's public link).
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Enter the product name.")
    .max(200, "Keep the name under 200 characters."),
  // Any existing category slug — the DB foreign key enforces it points to a
  // real category, so categories stay fully manageable from the admin.
  categorySlug: slugField,
  priceRwf: z.coerce
    .number({ error: "Enter the price in RWF (numbers only)." })
    .int("Enter the price in whole RWF.")
    .positive("Enter the price in RWF.")
    .max(100_000_000, "That price looks too high — check the zeros."),
  // Optional: a photo, name and price are enough to list a product.
  description: z.string().trim().max(2000, "Keep the description under 2,000 characters."),
  images: z
    .array(z.string().url().or(z.string().startsWith("/")))
    .max(8, "Up to 8 photos per product."),
  specs: z.record(z.string(), z.string()),
  featured: z.boolean(),
  inStock: z.boolean(),
});

// Like products, a category's slug comes from its name on creation and then
// stays fixed — products reference it and it is the category's public link.
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter the category name.").max(120),
  description: z.string().trim().max(300),
  intro: z.string().trim().max(1200),
  image: z.string().url().or(z.string().startsWith("/")).or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type CategoryFormInput = z.input<typeof categorySchema>;

export type ProductFormInput = z.input<typeof productSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export type SaveProductResult = { ok: true; slug: string } | { ok: false; error: string };

function productSaveError(error: { code?: string; message: string }): SaveProductResult {
  if (error.code === "23503") {
    return { ok: false, error: "That category no longer exists. Pick another one." };
  }
  if (error.code === "PGRST116") {
    return { ok: false, error: "This product was deleted in the meantime." };
  }
  return { ok: false, error: `Couldn't save: ${error.message}` };
}

export async function saveProduct(input: ProductFormInput): Promise<SaveProductResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the product details." };
  }
  const data = parsed.data;

  const row = {
    name: data.name,
    category_slug: data.categorySlug,
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

  let slug: string;
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
    // Two products may share a name ("Glass"); give the second a short suffix
    // instead of failing on the unique slug.
    const base = slugOrFallback(data.name, "product");
    let candidate = base;
    for (let attempt = 0; ; attempt++) {
      const { error } = await supabase.from("ou_products").insert({ ...row, slug: candidate });
      if (!error) break;
      if (error.code !== "23505" || attempt >= 4) return productSaveError(error);
      candidate = `${base}-${crypto.randomUUID().slice(0, 4)}`;
    }
    slug = candidate;
  }

  (await cookies()).set(LAST_CATEGORY_COOKIE, data.categorySlug, {
    path: "/admin",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
  });
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  return { ok: true, slug };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const { error } = await supabase.from("ou_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function saveCategory(
  input: CategoryFormInput,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category." };
  }
  const data = parsed.data;

  const row = {
    name: data.name,
    description: data.description,
    intro: data.intro,
    image: data.image,
    sort_order: data.sortOrder,
  };

  if (data.id) {
    const { error } = await supabase.from("ou_categories").update(row).eq("id", data.id);
    if (error) return { ok: false, error: `Couldn't save: ${error.message}` };
  } else {
    const base = slugOrFallback(data.name, "category");
    let candidate = base;
    for (let attempt = 0; ; attempt++) {
      const { error } = await supabase.from("ou_categories").insert({ ...row, slug: candidate });
      if (!error) break;
      if (error.code !== "23505" || attempt >= 4) {
        return { ok: false, error: `Couldn't save: ${error.message}` };
      }
      candidate = `${base}-${crypto.randomUUID().slice(0, 4)}`;
    }
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const { error } = await supabase.from("ou_categories").delete().eq("id", id);
  if (error) {
    return {
      ok: false,
      error:
        error.code === "23503"
          ? "This category still has products. Move or delete them first."
          : error.message,
    };
  }
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

const testimonialSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().trim().min(2).max(120),
  business: z.string().trim().max(160).nullable(),
  quote: z.string().trim().min(2).max(1000),
  photo: z.string().url().or(z.string().startsWith("/")).nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type TestimonialFormInput = z.input<typeof testimonialSchema>;

export async function saveTestimonial(
  input: TestimonialFormInput,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
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
  revalidatePath("/testimonials");
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const { error } = await supabase.from("ou_testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/testimonials");
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  return { ok: true };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  if (!LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase.from("ou_leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  if (!MESSAGE_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase.from("ou_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const { error } = await supabase
    .from("ou_orders")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function updateFreeDeliveryThreshold(
  value: number,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const threshold = Math.max(0, Math.round(value));
  const { error } = await supabase.from("ou_settings").upsert({
    key: "free_delivery_threshold_rwf",
    value: String(threshold),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

const logoUrlSchema = z
  .string()
  .trim()
  .max(500)
  .url()
  .startsWith("https://")
  .nullable();

// Only allow embedding trusted Google dashboard hosts in the admin iframe.
const analyticsEmbedSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (value) =>
      value === "" ||
      /^https:\/\/(lookerstudio|datastudio)\.google\.com\/embed\//.test(value),
    "Paste the Looker Studio EMBED url (lookerstudio.google.com/embed/…).",
  );

/** Sets or clears the Looker Studio dashboard embedded on the Analytics page. */
export async function updateAnalyticsEmbedUrl(
  url: string,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
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

const siteImageKeySchema = z.enum(
  Object.keys(SITE_IMAGE_KEYS) as [string, ...string[]],
);
const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\//.test(v) || v.startsWith("/"), "Invalid image URL.");

/** Sets or resets ("") one editable site photo. */
export async function updateSiteImage(
  key: string,
  url: string,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
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
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Sets or clears (null) the brand logo shown in the nav and footer. */
export async function updateLogoUrl(
  url: string | null,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
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

const productFlagsSchema = z
  .object({
    id: z.string().uuid(),
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
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
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

/**
 * Clears out empty category *labels*: categories with no products and no
 * cover photo. Departments (categories with a cover photo) are always kept,
 * even while empty, because they anchor the homepage. Products are never
 * touched — a category still used by a product is skipped, and the database's
 * foreign key would refuse it anyway. Returns how many were removed.
 */
export async function deleteEmptyCategories(): Promise<
  { ok: true; removed: number } | { ok: false; error: string }
> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const [{ data: cats, error: catError }, { data: used, error: usedError }] =
    await Promise.all([
      supabase.from("ou_categories").select("id, slug, image"),
      supabase.from("ou_products").select("category_slug"),
    ]);
  if (catError || usedError) {
    return { ok: false, error: (catError ?? usedError)?.message ?? "Could not read categories." };
  }
  const inUse = new Set((used ?? []).map((row) => row.category_slug as string));
  const emptyIds = (cats ?? [])
    .filter((row) => !inUse.has(row.slug as string) && !String(row.image ?? "").trim())
    .map((row) => row.id as string);
  if (emptyIds.length === 0) return { ok: true, removed: 0 };

  const { error } = await supabase.from("ou_categories").delete().in("id", emptyIds);
  if (error) return { ok: false, error: error.message };
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  return { ok: true, removed: emptyIds.length };
}
