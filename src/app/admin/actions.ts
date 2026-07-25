"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import type { CategorySlug, OrderStatus } from "@/lib/types";

const CATEGORY_SLUGS: CategorySlug[] = [
  "cookware",
  "dinnerware",
  "cutlery",
  "storage",
  "small-appliances",
  "serveware",
];

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes"),
  categorySlug: z.enum(CATEGORY_SLUGS as [CategorySlug, ...CategorySlug[]]),
  priceRwf: z.coerce.number().int().nonnegative().max(100_000_000),
  shortDescription: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(5000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(8),
  specs: z.record(z.string(), z.string()),
  featured: z.boolean(),
  inStock: z.boolean(),
});

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
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That slug is already in use. Choose a different one."
          : error.message,
    };
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
