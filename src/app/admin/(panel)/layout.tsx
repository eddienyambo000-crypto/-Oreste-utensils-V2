import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                Oreste
              </span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-copper">
                Admin
              </span>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="text-ink-soft transition-colors duration-200 hover:text-copper"
            >
              View site
            </Link>
            {user?.email && (
              <span className="hidden text-ink-faint sm:inline">{user.email}</span>
            )}
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-line-strong px-4 py-1.5 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}
