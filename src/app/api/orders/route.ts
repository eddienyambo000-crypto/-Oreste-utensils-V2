import { NextResponse } from "next/server";
import { getFreeDeliveryThreshold } from "@/lib/data";
import { priceOrder, type PricedProduct } from "@/lib/orderPricing";
import { orderInputSchema } from "@/lib/orderSchema";
import { seedProducts } from "@/lib/seed";
import { getServiceClient } from "@/lib/supabase/admin";
import { getPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

/**
 * Records an order. The server is the source of truth: the browser says which
 * products and how many, and every name, price, total and the free-delivery
 * decision come from the database here. When Supabase isn't configured
 * (local development) orders are priced against the seed catalogue and
 * accepted without being stored.
 */

// Naive in-memory rate limit — per instance, best-effort. It blunts rapid
// abuse; the honeypot and validation do the rest.
const RATE_LIMIT = 8;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Current catalogue entries for the requested ids, or null if unreachable. */
async function loadCatalogue(ids: string[]): Promise<Map<string, PricedProduct> | null> {
  if (!isSupabaseConfigured) {
    return new Map(
      seedProducts
        .filter((p) => ids.includes(p.id))
        .map((p) => [p.id, { id: p.id, slug: p.slug, name: p.name, priceRwf: p.priceRwf, inStock: p.inStock, image: p.images[0] ?? "" }]),
    );
  }
  const validIds = ids.filter((id) => UUID.test(id));
  if (validIds.length === 0) return new Map();
  const { data, error } = await getPublicClient()
    .from("ou_products")
    .select("id, slug, name, price_rwf, in_stock, images")
    .in("id", validIds);
  if (error) return null;
  return new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        priceRwf: Number(row.price_rwf),
        inStock: Boolean(row.in_stock),
        image: ((row.images as string[] | null) ?? [])[0] ?? "",
      },
    ]),
  );
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order." }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot filled → silently accept without recording (don't tip off bots).
  if (data.company) {
    return NextResponse.json({ ok: true, id: null });
  }

  const [catalogue, threshold] = await Promise.all([
    loadCatalogue([...new Set(data.items.map((item) => item.productId))]),
    getFreeDeliveryThreshold(),
  ]);
  if (!catalogue) {
    return NextResponse.json({ error: "We couldn't check your order. Please try again or use WhatsApp." }, { status: 503 });
  }

  const priced = priceOrder(data.items, catalogue);
  if (!priced.ok) {
    return NextResponse.json(
      {
        error: `No longer available: ${priced.unavailable.join(", ")}. Remove from your cart to continue.`,
        code: "unavailable",
        unavailable: priced.unavailable,
      },
      { status: 409 },
    );
  }

  const { items, subtotal } = priced;
  const deliveryFree = data.fulfillment === "pickup" || subtotal >= threshold;

  const supabase = getServiceClient();
  if (!supabase) {
    if (isSupabaseConfigured) {
      // Database present but the server key is missing: never pretend an
      // order was recorded.
      console.error("[orders] SUPABASE_SERVICE_ROLE_KEY is not set; order not stored.");
      return NextResponse.json({ error: "We couldn't save your order. Please try WhatsApp instead." }, { status: 503 });
    }
    // Local development without a database: priced, not stored.
    return NextResponse.json({ ok: true, id: null, items, subtotal, threshold, mode: "seed" });
  }

  const { data: inserted, error } = await supabase
    .from("ou_orders")
    .insert({
      customer_name: data.customerName,
      phone: data.phone,
      fulfillment: data.fulfillment,
      delivery_area: data.fulfillment === "delivery" ? data.deliveryArea : null,
      note: data.note,
      items,
      subtotal_rwf: subtotal,
      delivery_free: deliveryFree,
      total_rwf: subtotal,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "We couldn't save your order. Please try WhatsApp instead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.id, items, subtotal, threshold });
}
