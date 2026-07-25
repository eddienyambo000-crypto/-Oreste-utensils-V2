import { SettingsForm } from "./SettingsForm";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getFreeDeliveryThreshold } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const threshold = await getFreeDeliveryThreshold();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Settings</h1>
      <SettingsForm initialThreshold={threshold} />
    </div>
  );
}
