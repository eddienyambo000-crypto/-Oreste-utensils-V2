import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CleanupButton } from "./CleanupButton";
import { IconPlus } from "@/components/ui/icons";
import { getCategories } from "@/lib/data";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [categories, { data: used }] = await Promise.all([
    getCategories(),
    supabase.from("ou_products").select("category_slug"),
  ]);

  const counts = new Map<string, number>();
  for (const row of (used ?? []) as { category_slug: string }[]) {
    counts.set(row.category_slug, (counts.get(row.category_slug) ?? 0) + 1);
  }
  const rows = [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((category) => ({
      ...category,
      count: counts.get(category.slug) ?? 0,
      isDepartment: category.image.trim() !== "",
    }));
  const removable = rows.filter((c) => c.count === 0 && !c.isDepartment).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Categories <span className="font-normal text-ink-faint">({rows.length})</span>
        </h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-copper px-5 text-sm font-semibold text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          <IconPlus className="h-4 w-4" />
          New category
        </Link>
      </div>

      <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
        Categories with a cover photo are <strong className="font-semibold text-ink">departments</strong> and
        appear on the homepage. The shop only lists categories that have products, so empty ones stay hidden
        from customers.
      </p>

      {removable > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-cream/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">
            {removable} categor{removable === 1 ? "y has" : "ies have"} no products and no cover photo.
          </p>
          <CleanupButton count={removable} />
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No categories yet. Add one to start organising the shop.
        </p>
      ) : (
        <ul role="list" className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {rows.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/categories/${category.id}`}
                className="flex min-h-16 items-center gap-4 px-4 py-3 transition-colors duration-200 hover:bg-cream/50"
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {category.isDepartment && (
                    <Image src={category.image} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{category.name}</span>
                  <span className="mt-0.5 block text-sm text-ink-faint">
                    {category.count === 0 ? "No products" : `${category.count} product${category.count === 1 ? "" : "s"}`}
                  </span>
                </span>
                {category.isDepartment && (
                  <span className="shrink-0 rounded-full bg-copper-tint px-2.5 py-1 text-xs font-semibold text-copper-deep">
                    Department
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
