import Link from "next/link";
import { InstallAppCard } from "./InstallAppCard";
import { OrderCard } from "./OrderCard";
import { IconArrowRight, IconBag, IconCamera, IconGrid } from "@/components/ui/icons";
import { fetchLeads } from "@/lib/admin/leads";
import { fetchOrders } from "@/lib/admin/orders";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";

interface StockRow {
  in_stock: boolean;
  featured: boolean;
  images: string[] | null;
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [orders, { data: stock }, { count: newOrders }, { leads }] = await Promise.all([
    fetchOrders(supabase, 4),
    supabase.from("ou_products").select("in_stock, featured, images"),
    supabase.from("ou_orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    fetchLeads(supabase),
  ]);

  const products = (stock ?? []) as StockRow[];
  const soldOut = products.filter((p) => !p.in_stock).length;
  const noPhoto = products.filter((p) => !p.images?.length).length;
  const starred = products.filter((p) => p.featured && p.images?.length).length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;

  const actions = [
    { href: "/admin/products/new", label: "Add a product", hint: "Photo, name, price", Icon: IconCamera, primary: true },
    { href: "/admin/products", label: "Products", hint: `${products.length} listed`, Icon: IconGrid },
    {
      href: "/admin/orders",
      label: "Orders",
      hint: newOrders ? `${newOrders} new` : "No new orders",
      Icon: IconBag,
    },
  ];

  const stats = [
    { label: "New orders", value: newOrders ?? 0, href: "/admin/orders" },
    { label: "New trade leads", value: newLeads, href: "/admin/leads" },
    { label: "Sold out", value: soldOut, href: "/admin/products" },
    { label: "Without a photo", value: noPhoto, href: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Overview</h1>

      <ul role="list" className="grid gap-3 sm:grid-cols-3">
        {actions.map(({ href, label, hint, Icon, primary }) => (
          <li key={href}>
            <Link
              href={href}
              className={`group flex min-h-20 items-center gap-4 rounded-2xl p-4 transition-[background-color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-[0.99] ${
                primary
                  ? "bg-copper text-white shadow-copper hover:bg-copper-deep"
                  : "border border-line bg-surface text-ink hover:border-copper"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  primary ? "bg-white/15" : "bg-cream text-copper"
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className={`block text-sm ${primary ? "text-white/80" : "text-ink-faint"}`}>{hint}</span>
              </span>
              <IconArrowRight
                className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                  primary ? "text-white/80" : "text-ink-faint"
                }`}
              />
            </Link>
          </li>
        ))}
      </ul>

      <InstallAppCard />

      <section aria-labelledby="at-a-glance">
        <h2 id="at-a-glance" className="sr-only">
          At a glance
        </h2>
        <ul role="list" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className="block rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-copper sm:p-5"
              >
                <span className="block text-sm text-ink-soft">{stat.label}</span>
                <span className="mt-1 block font-display text-3xl font-semibold tabular-nums">{stat.value}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">
          {starred > 0
            ? `The homepage shows your ${starred} starred product${starred === 1 ? "" : "s"}.`
            : "No products are starred, so the homepage shows the newest ones with photos. Star products in Products to choose them yourself."}
        </p>
      </section>

      <section aria-labelledby="recent-orders">
        <div className="flex items-center justify-between">
          <h2 id="recent-orders" className="font-display text-xl font-semibold">
            Latest orders
          </h2>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-11 items-center text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
          >
            All orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center text-ink-soft">
            No orders yet. They appear here the moment a customer checks out.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
