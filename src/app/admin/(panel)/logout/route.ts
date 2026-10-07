import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Same origin as the request, so signing out locally stays local.
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
}
