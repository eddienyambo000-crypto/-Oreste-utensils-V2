import type { Metadata } from "next";
import { ProductEditor } from "../ProductEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  await requireAdmin();
  return <ProductEditor />;
}
