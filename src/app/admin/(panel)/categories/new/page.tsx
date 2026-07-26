import { CategoryEditor } from "../CategoryEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();
  return <CategoryEditor />;
}
