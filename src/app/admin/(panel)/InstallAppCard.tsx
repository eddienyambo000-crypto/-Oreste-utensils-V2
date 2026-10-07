"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { IconDownload } from "@/components/ui/icons";

/** Chrome/Edge/Samsung Internet's install prompt (not in the DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STANDALONE_QUERY = "(display-mode: standalone)";

function subscribeDisplayMode(onChange: () => void) {
  const media = window.matchMedia(STANDALONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isStandalone() {
  return (
    window.matchMedia(STANDALONE_QUERY).matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

const noSubscribe = () => () => {};

/**
 * Puts the admin on the owner's home screen as its own app. One tap where the
 * browser supports an install prompt; the exact steps on iPhone/iPad, where
 * it doesn't. Hidden once the admin is already running as the installed app.
 */
export function InstallAppCard() {
  const standalone = useSyncExternalStore(subscribeDisplayMode, isStandalone, () => true);
  const ios = useSyncExternalStore(noSubscribe, isIos, () => false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <section
      aria-labelledby="install-title"
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
        <img src="/icons/admin-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
        <div>
          <h2 id="install-title" className="font-display text-lg font-semibold">
            {installed ? "Installed — find “Oreste Admin” on your home screen" : "Put the admin on your phone"}
          </h2>
          {!installed && (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {prompt ? (
                "Adds an “Oreste Admin” icon to your home screen. Tap it, take a photo, and the product is live."
              ) : ios ? (
                <>
                  In Safari, tap <strong className="font-semibold text-ink">Share</strong> (the square with an
                  arrow), then <strong className="font-semibold text-ink">Add to Home Screen</strong>.
                </>
              ) : (
                <>
                  Open this page in Chrome on your phone, tap the <strong className="font-semibold text-ink">⋮</strong>{" "}
                  menu, then <strong className="font-semibold text-ink">Add to Home screen</strong>.
                </>
              )}
            </p>
          )}
        </div>
      </div>
      {prompt && !installed && (
        <button
          type="button"
          onClick={install}
          className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-porcelain transition-[background-color,transform] duration-200 hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.98]"
        >
          <IconDownload className="h-5 w-5" />
          Install app
        </button>
      )}
    </section>
  );
}
