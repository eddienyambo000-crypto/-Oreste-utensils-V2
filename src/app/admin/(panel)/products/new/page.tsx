import { ProductEditor } from "../ProductEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  return <ProductEditor />;
}
