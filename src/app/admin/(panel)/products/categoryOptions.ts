import type { Category } from "@/lib/types";
import type { CategoryOption } from "./ProductEditor";

/** Categories for the product editor, in shop order, departments marked. */
export function categoryOptions(categories: Category[]): CategoryOption[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((c) => ({ slug: c.slug, name: c.name, isDepartment: c.image.trim() !== "" }));
}
