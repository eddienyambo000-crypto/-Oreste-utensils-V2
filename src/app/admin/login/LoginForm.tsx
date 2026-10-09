"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const FORBIDDEN =
  "That account doesn't have admin access. Sign in with the shop's admin account.";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set by the proxy when a non-admin account tried to get in.
  const forbidden = searchParams.get("error") === "forbidden";
  const message = error ?? (forbidden && !loading ? FORBIDDEN : null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.status === 400 ? "Incorrect email or password." : "Couldn't sign in. Check your connection and try again.",
      );
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") ?? "/admin";
    router.replace(next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  const fieldClass =
    "mt-1.5 min-h-12 w-full rounded-xl border border-line-strong bg-porcelain px-4 text-base text-ink";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </div>

      {message && (
        <p role="alert" className="rounded-xl bg-copper-tint/50 px-4 py-2.5 text-sm text-copper-deep">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full cursor-pointer rounded-full bg-copper px-6 font-semibold text-on-copper shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
