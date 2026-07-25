import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminOrder } from "@/app/admin/(panel)/OrderCard";
import type { CartItem, OrderStatus } from "@/lib/types";

interface OrderRow {
  id: string;
  customer_name: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  delivery_area: string | null;
  note: string | null;
  items: CartItem[];
  subtotal_rwf: number;
  delivery_free: boolean;
  status: OrderStatus;
  created_at: string;
}

function mapOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    fulfillment: row.fulfillment,
    deliveryArea: row.delivery_area,
    note: row.note,
    items: Array.isArray(row.items) ? row.items : [],
    subtotalRwf: row.subtotal_rwf,
    deliveryFree: row.delivery_free,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchOrders(
  supabase: SupabaseClient,
  limit?: number,
): Promise<AdminOrder[]> {
  let query = supabase
    .from("ou_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapOrder);
}
