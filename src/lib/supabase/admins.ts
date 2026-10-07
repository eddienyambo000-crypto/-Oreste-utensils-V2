/**
 * Accounts allowed into /admin. Being signed in is not enough: Supabase
 * sign-ups are open, so any registered user must never count as the shop.
 *
 * Keep in sync with `public.ou_is_admin()` (supabase/migrations/0006), which
 * enforces the same rule inside the database. ADMIN_EMAILS (comma-separated,
 * server-only) replaces the default list without a code change.
 */
const DEFAULT_ADMIN_EMAILS = ["oresteutensils@gmail.com"];

export function adminEmails(raw = process.env.ADMIN_EMAILS): string[] {
  const fromEnv = (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | null | undefined, allowed = adminEmails()): boolean {
  if (!email) return false;
  return allowed.includes(email.trim().toLowerCase());
}
