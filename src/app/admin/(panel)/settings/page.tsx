import Link from "next/link";
import { LogoManager } from "./LogoManager";
import { SettingsForm } from "./SettingsForm";
import { SiteImagesManager } from "./SiteImagesManager";
import { IconArrowRight } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getFreeDeliveryThreshold, getLogoUrl, getSiteImages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [threshold, logoUrl, siteImages] = await Promise.all([
    getFreeDeliveryThreshold(),
    getLogoUrl(),
    getSiteImages(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Settings</h1>
      <LogoManager initialLogoUrl={logoUrl} />

      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Homepage product rail</h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-soft">
          The products that slide across the homepage are your real products, so
          their photo, name, price and stock always match the shop. To choose which
          ones appear, open <span className="font-medium text-ink">Products</span> and
          tap the star on the items you want to show. If none are starred, your
          newest products appear automatically.
        </p>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition-colors duration-200 hover:text-copper-deep"
        >
          Choose homepage products
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <SiteImagesManager images={siteImages} />
      <SettingsForm initialThreshold={threshold} />
    </div>
  );
}
