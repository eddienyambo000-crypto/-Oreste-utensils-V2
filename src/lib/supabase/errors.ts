/**
 * True when a Supabase/Postgres error means the table doesn't exist yet
 * (migration not run). PostgREST surfaces this as PGRST205 (schema cache
 * miss); the raw Postgres code is 42P01. Handling both lets admin pages show
 * a "run the migration" notice instead of crashing.
 */
export function isMissingTableError(error: {
  code?: string | null;
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (code === "42P01" || code === "PGRST205" || code === "PGRST204") return true;
  const message = error.message ?? "";
  return /could not find the table|does not exist|schema cache/i.test(message);
}
