import { LogoManager } from "./LogoManager";
import { SettingsForm } from "./SettingsForm";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getFreeDeliveryThreshold, getLogoUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [threshold, logoUrl] = await Promise.all([
    getFreeDeliveryThreshold(),
    getLogoUrl(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Settings</h1>
      <LogoManager initialLogoUrl={logoUrl} />
      <SettingsForm initialThreshold={threshold} />
    </div>
  );
}
