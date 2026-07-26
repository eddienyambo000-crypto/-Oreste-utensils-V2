import { ProductEditor } from "../ProductEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategories();
  return (
    <ProductEditor
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
    />
  );
}
