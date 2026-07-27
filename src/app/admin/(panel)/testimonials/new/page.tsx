import { TestimonialEditor } from "../TestimonialEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await requireAdmin();
  return <TestimonialEditor />;
}
