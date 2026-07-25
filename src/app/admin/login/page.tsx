import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { BUSINESS } from "@/lib/constants";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            Oreste
          </span>
          <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-copper">
            Admin
          </span>
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h1 className="font-display text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Manage {BUSINESS.name} products and orders.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
