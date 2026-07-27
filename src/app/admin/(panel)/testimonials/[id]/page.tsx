import { notFound } from "next/navigation";
import { TestimonialEditor } from "../TestimonialEditor";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

interface TestimonialRow {
  id: string;
  client_name: string;
  business: string | null;
  quote: string;
  photo: string | null;
  rating: number;
  sort_order: number;
  created_at: string;
}

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("ou_testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const row = data as TestimonialRow;

  const testimonial: Testimonial = {
    id: row.id,
    clientName: row.client_name,
    business: row.business,
    quote: row.quote,
    photo: row.photo,
    rating: row.rating,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };

  return <TestimonialEditor testimonial={testimonial} />;
}
