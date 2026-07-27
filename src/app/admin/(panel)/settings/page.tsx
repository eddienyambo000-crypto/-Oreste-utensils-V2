import { LogoManager } from "./LogoManager";
import { SettingsForm } from "./SettingsForm";
import { SiteImagesManager } from "./SiteImagesManager";
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
      <SiteImagesManager images={siteImages} />
      <SettingsForm initialThreshold={threshold} />
    </div>
  );
}
