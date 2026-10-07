import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ProductEditor } from "../ProductEditor";
import { categoryOptions } from "../categoryOptions";
import { LAST_CATEGORY_COOKIE } from "@/lib/admin/preferences";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, store] = await Promise.all([getCategories(), cookies()]);
  return (
    <ProductEditor
      categories={categoryOptions(categories)}
      defaultCategory={store.get(LAST_CATEGORY_COOKIE)?.value}
    />
  );
}
