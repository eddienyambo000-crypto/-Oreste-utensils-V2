import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — SERVER ONLY. Never import this into client code.
 * Used by the order API route to insert orders past RLS, and by admin
 * server actions. Falls back to null when the key isn't configured so the
 * site still runs in seed mode.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasServiceRole = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  cached ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
