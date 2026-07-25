import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
        <span className="rounded-full bg-copper-tint px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          Admin
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">
          Connect Supabase to enable the dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The storefront runs on seed data right now. Add your Supabase URL,
          anon key and service-role key to <code className="rounded bg-cream px-1.5 py-0.5 text-copper-deep">.env.local</code>,
          run the migration in <code className="rounded bg-cream px-1.5 py-0.5 text-copper-deep">supabase/migrations</code>,
          then create an admin user in Supabase Auth to sign in here.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
