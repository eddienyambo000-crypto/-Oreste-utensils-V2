import { OrderCard } from "../OrderCard";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { fetchOrders } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const orders = await fetchOrders(supabase);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
        Orders <span className="text-ink-faint">({orders.length})</span>
      </h1>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No orders yet. When a customer checks out, their order lands here with
          full contact details and items.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
