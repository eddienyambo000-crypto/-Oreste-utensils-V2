import Link from "next/link";
import { OrderCard } from "./OrderCard";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { fetchOrders } from "@/lib/admin/orders";
import { fetchLeads } from "@/lib/admin/leads";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const [orders, productCount, outOfStock] = await Promise.all([
    fetchOrders(supabase, 5),
    supabase.from("ou_products").select("id", { count: "exact", head: true }),
    supabase
      .from("ou_products")
      .select("id", { count: "exact", head: true })
      .eq("in_stock", false),
  ]);

  const [{ count: newOrders }, { leads }] = await Promise.all([
    supabase
      .from("ou_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    fetchLeads(supabase),
  ]);

  const newLeads = leads.filter((lead) => lead.status === "new").length;

  const stats = [
    { label: "New orders", value: newOrders ?? 0 },
    { label: "New leads", value: newLeads },
    { label: "Products", value: productCount.count ?? 0 },
    { label: "Out of stock", value: outOfStock.count ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Overview</h1>
        <Link
          href="/admin/products/new"
          className="cursor-pointer rounded-full bg-copper px-5 py-2.5 text-sm font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          + New product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section aria-labelledby="recent-orders">
        <div className="flex items-center justify-between">
          <h2 id="recent-orders" className="font-display text-xl font-semibold">
            Latest orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
          >
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center text-ink-soft">
            No orders yet. They&apos;ll appear here the moment a customer checks out.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
