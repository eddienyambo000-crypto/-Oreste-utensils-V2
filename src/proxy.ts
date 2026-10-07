import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/supabase/admins";

/**
 * Refreshes the Supabase auth session on every admin request and guards the
 * admin area: only accounts on the admin list get in. Any other signed-in
 * account (sign-ups are public) is signed out and shown why. When Supabase
 * isn't configured (local seed mode) it passes through — the admin pages then
 * render a "connect Supabase" notice instead of crashing.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Redirects must carry any cookies Supabase just set (a refreshed or
  // cleared session), or the browser keeps the stale ones.
  function redirectTo(pathname: string, params: Record<string, string> = {}) {
    const target = request.nextUrl.clone();
    target.pathname = pathname;
    target.search = new URLSearchParams(params).toString();
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (user && !isAdminEmail(user.email)) {
    await supabase.auth.signOut({ scope: "local" });
    return isLogin ? response : redirectTo("/admin/login", { error: "forbidden" });
  }

  if (!user && !isLogin) return redirectTo("/admin/login", { next: pathname });
  if (user && isLogin) return redirectTo("/admin");

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
