import Link from "next/link";
import type { ReactNode } from "react";
import { AddProductFab } from "./AddProductFab";
import { AdminNav } from "./AdminNav";
import { IconExternal } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-dvh">
      {/* Top padding clears the status bar when running as the installed app. */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <Link href="/admin" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-ink">Oreste</span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-copper">Admin</span>
            </Link>
            <div className="flex items-center gap-1 text-sm sm:gap-3">
              {user?.email && <span className="hidden text-ink-faint lg:inline">{user.email}</span>}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-medium text-ink-soft transition-colors duration-200 hover:text-copper"
              >
                View shop
                <IconExternal className="h-4 w-4" />
              </a>
              <form action="/admin/logout" method="post">
                <button
                  type="submit"
                  className="min-h-11 cursor-pointer rounded-full border border-line-strong px-4 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:pt-8">{children}</main>
      <AddProductFab />
    </div>
  );
}
