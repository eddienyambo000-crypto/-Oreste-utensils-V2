import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client for public catalog reads (products, categories, settings).
 * Safe on server and client — RLS restricts what the anon role can touch.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  cached ??= createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cached;
}
