import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-6xl font-bold text-copper">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em]">
        {dict.notFound.title}
      </h1>
      <p className="mt-3 text-ink-soft">{dict.notFound.body}</p>
      <Link
        href="/shop"
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
      >
        {dict.common.browseShop}
        <IconArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
