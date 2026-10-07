"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n/LanguageProvider";

/**
 * Light/dark toggle. The pre-paint inline script in the root layout has
 * already applied the stored choice, so this only mirrors the current state
 * and flips it. Persists to localStorage (read back by that script).
 */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { dict } = useLang();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync from the DOM once JS is running — the value can't be known during
    // SSR, so this deliberately sets state on mount.
    const explicit = document.documentElement.getAttribute("data-theme");
    const isDark = explicit
      ? explicit === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage blocked — the attribute still applies for this session.
    }
  }

  const label = dark ? dict.theme.toLight : dict.theme.toDark;
  // Render the moon until mounted so server + first client render match.
  const icon = mounted && dark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />;

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-cream"
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-cream"
    >
      {icon}
    </button>
  );
}
