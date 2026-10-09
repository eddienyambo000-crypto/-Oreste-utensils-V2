"use client";

import { resetConsent } from "@/lib/analytics";

/** Footer link that reopens the cookie banner so a visitor can change their mind. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={resetConsent}
      className="cursor-pointer transition-colors duration-200 hover:text-copper"
    >
      {label}
    </button>
  );
}
