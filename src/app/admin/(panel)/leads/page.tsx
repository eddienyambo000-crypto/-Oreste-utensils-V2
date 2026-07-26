import { LeadCard } from "../LeadCard";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { fetchLeads } from "@/lib/admin/leads";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const { leads, pendingMigration } = await fetchLeads(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Wholesale leads <span className="text-ink-faint">({leads.length})</span>
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Trade enquiries from restaurants, hotels and other businesses.
        </p>
      </div>

      {pendingMigration ? (
        <div className="rounded-2xl border border-copper/30 bg-copper-tint/30 p-6 text-sm text-copper-deep">
          <p className="font-medium">One quick step to enable leads.</p>
          <p className="mt-1">
            Run <code className="rounded bg-porcelain px-1.5 py-0.5">supabase/migrations/0003_leads.sql</code>{" "}
            in the Supabase SQL editor. Until then, trade enquiries still reach you
            over WhatsApp — they just aren&apos;t recorded here yet.
          </p>
        </div>
      ) : leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No leads yet. Business enquiries from the For Business page land here.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
