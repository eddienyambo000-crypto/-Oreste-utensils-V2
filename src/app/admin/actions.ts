"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { SITE_IMAGE_KEYS } from "@/lib/constants";
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

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(200),
  slug: slugField,
  // Any existing category slug — the DB foreign key enforces it points to a
  // real category, so categories stay fully manageable from the admin.
  categorySlug: slugField,
  priceRwf: z.coerce.number().int().nonnegative().max(100_000_000),
  shortDescription: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(5000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(8),
  specs: z.record(z.string(), z.string()),
  featured: z.boolean(),
  inStock: z.boolean(),
});

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  slug: slugField,
  description: z.string().trim().max(300),
  intro: z.string().trim().max(1200),
  image: z.string().url().or(z.string().startsWith("/")).or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type CategoryFormInput = z.input<typeof categorySchema>;

export type ProductFormInput = z.input<typeof productSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveProduct(
  input: ProductFormInput,
): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  }
  const data = parsed.data;

  const row = {
    name: data.name,
    slug: data.slug,
    category_slug: data.categorySlug,
    price_rwf: data.priceRwf,
    short_description: data.shortDescription,
    description: data.description,
    images: data.images,
    specs: data.specs,
    featured: data.featured,
    in_stock: data.inStock,
  };

  const query = data.id
    ? supabase.from("ou_products").update(row).eq("id", data.id)
    : supabase.from("ou_products").insert(row);

  const { error } = await query;
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already in use. Choose a different one." };
    }
    if (error.code === "23503") {
      return { ok: false, error: "That category no longer exists. Pick another one." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase, configured } = await requireAdmin();
  if (!configured || !supabase) {
    return { ok: false, error: "Supabase is not connected." };
  }
  const { error } = await supabase.from("ou_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
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
    slug: data.slug,
    description: data.description,
    intro: data.intro,
    image: data.image,
    sort_order: data.sortOrder,
  };

  const query = data.id
    ? supabase.from("ou_categories").update(row).eq("id", data.id)
    : supabase.from("ou_categories").insert(row);

  const { error } = await query;
  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That slug is already in use. Choose a different one."
          : error.message,
    };
  }

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
