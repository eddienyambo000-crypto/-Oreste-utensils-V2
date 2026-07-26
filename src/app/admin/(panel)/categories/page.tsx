import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Categories <span className="text-ink-faint">({categories.length})</span>
        </h1>
        <Link
          href="/admin/categories/new"
          className="cursor-pointer rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          + New category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No categories yet. Add one to start organising the shop.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/categories/${category.id}`}
                className="flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-cream/50"
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-ink-faint">
                    /shop/{category.slug}
                  </span>
                </span>
                <span className="text-xs text-ink-faint">#{category.sortOrder}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
