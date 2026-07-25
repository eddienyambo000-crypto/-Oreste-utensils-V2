import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-6xl font-bold text-copper">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em]">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-ink-soft">
        The link may be out of date, or the item may have sold out and moved on.
        Let&apos;s get you back to the good stuff.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
      >
        Back to the shop
        <IconArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
