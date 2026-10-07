"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCamera } from "@/components/ui/icons";

/**
 * Phone shortcut to the quick-add screen, reachable with a thumb from any
 * admin page. Hidden inside the product editor itself and on larger screens,
 * where the page headers carry the same action.
 */
export function AddProductFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin/products/")) return null;

  return (
    <Link
      href="/admin/products/new"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-14 items-center gap-2 rounded-full bg-copper pl-5 pr-6 font-semibold text-white shadow-[0_10px_30px_-8px_rgb(134_66_31/0.6)] transition-[background-color,transform] duration-200 hover:bg-copper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-95 md:hidden"
    >
      <IconCamera className="h-5 w-5" />
      Add product
    </Link>
  );
}
