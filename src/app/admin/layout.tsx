import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/public";

// Its own installable app: "Oreste Admin" on the owner's home screen opens
// straight into the dashboard, separate from the storefront app.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Oreste Admin" },
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Oreste Admin", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/admin-apple-180.png", sizes: "180x180" }],
  },
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
