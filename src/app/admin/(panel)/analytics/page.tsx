import { AnalyticsEmbedManager } from "./AnalyticsEmbedManager";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { getAnalyticsEmbedUrl } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { IconChart, IconExternal } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

interface Kpi {
  label: string;
  value: string;
  sub?: string;
}

export default async function AdminAnalyticsPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [
    ordersRes,
    newOrdersRes,
    leadsRes,
    newLeadsRes,
    productsRes,
    outStockRes,
    revenueRes,
    embedUrl,
  ] = await Promise.all([
    supabase.from("ou_orders").select("id", { count: "exact", head: true }),
    supabase.from("ou_orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("ou_leads").select("id", { count: "exact", head: true }),
    supabase.from("ou_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("ou_products").select("id", { count: "exact", head: true }),
    supabase.from("ou_products").select("id", { count: "exact", head: true }).eq("in_stock", false),
    supabase.from("ou_orders").select("total_rwf").neq("status", "cancelled"),
    getAnalyticsEmbedUrl(),
  ]);

  const revenue = (
    (revenueRes.data as { total_rwf: number }[] | null) ?? []
  ).reduce((sum, row) => sum + (row.total_rwf ?? 0), 0);

  const kpis: Kpi[] = [
    {
      label: "Orders",
      value: String(ordersRes.count ?? 0),
      sub: `${newOrdersRes.count ?? 0} new to action`,
    },
    {
      label: "Order value",
      value: formatRwf(revenue),
      sub: "Excludes cancelled",
    },
    {
      label: "Trade leads",
      value: String(leadsRes.count ?? 0),
      sub: `${newLeadsRes.count ?? 0} new`,
    },
    {
      label: "Products live",
      value: String(productsRes.count ?? 0),
      sub: `${outStockRes.count ?? 0} out of stock`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your shop at a glance, plus website behaviour from Google Analytics.
        </p>
      </div>

      {/* Store KPIs from the live database */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl">
              {kpi.value}
            </p>
            {kpi.sub && <p className="mt-1 text-xs text-ink-soft">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Website behaviour: embedded dashboard or setup prompt */}
      <section aria-labelledby="behaviour-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <IconChart className="h-5 w-5 text-copper" />
          <h2 id="behaviour-heading" className="font-display text-lg font-semibold">
            Website behaviour
          </h2>
        </div>

        {embedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <iframe
              title="Website analytics dashboard"
              src={embedUrl}
              className="h-[600px] w-full"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        ) : (
          <AnalyticsEmbedManager initialUrl={embedUrl} />
        )}
      </section>

      {/* Quick links to the full analytics tools */}
      <section aria-labelledby="tools-heading" className="space-y-4">
        <h2 id="tools-heading" className="font-display text-lg font-semibold">
          Open the full tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-copper"
          >
            <div>
              <p className="font-medium text-ink">Google Analytics</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Real-time visitors, traffic sources, top pages, conversions.
              </p>
            </div>
            <IconExternal className="h-5 w-5 shrink-0 text-ink-faint" />
          </a>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-copper"
          >
            <div>
              <p className="font-medium text-ink">Vercel Analytics</p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Real-user speed and traffic, straight from the hosting.
              </p>
            </div>
            <IconExternal className="h-5 w-5 shrink-0 text-ink-faint" />
          </a>
        </div>
        {embedUrl && (
          <div className="pt-2">
            <AnalyticsEmbedManager initialUrl={embedUrl} />
          </div>
        )}
      </section>
    </div>
  );
}
