import { notFound } from "next/navigation";
import { CategoryEditor } from "../CategoryEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import type { Category, CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CategoryRow {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  intro: string;
  image: string;
  sort_order: number;
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("ou_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const row = data as CategoryRow;

  const category: Category = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    intro: row.intro,
    image: row.image,
    sortOrder: row.sort_order,
  };

  return <CategoryEditor category={category} />;
}
