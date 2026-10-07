import { redirect } from "next/navigation";
import { isAdminEmail } from "./admins";
import { isSupabaseConfigured } from "./public";
import { createSupabaseServerClient } from "./server";

/**
 * Ensures a signed-in *admin* session and returns the cookie-bound Supabase
 * client (which respects RLS). Use in every admin server component and server
 * action. A signed-in account that isn't on the admin list is sent back to
 * the login page — the proxy has normally signed it out already.
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
  if (!isAdminEmail(user.email)) redirect("/admin/login?error=forbidden");
  return { supabase, user, configured: true as const };
}
