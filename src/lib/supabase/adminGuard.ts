import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./public";
import { createSupabaseServerClient } from "./server";

/**
 * Ensures an authenticated admin session and returns the cookie-bound
 * Supabase client (which respects RLS — admin has full access). Use in every
 * admin server component and server action. Redirects to login when needed.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) {
    return { supabase: null, configured: false as const };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return { supabase, user, configured: true as const };
}
