import { NextResponse } from "next/server";
import { orderInputSchema } from "@/lib/orderSchema";
import { getFreeDeliveryThreshold } from "@/lib/data";
import { getServiceClient } from "@/lib/supabase/admin";

/**
 * Records an order. Server is the source of truth for totals and the
 * free-delivery decision — never trust amounts computed on the client.
 * When Supabase isn't configured the order is accepted (seed mode) so the
 * WhatsApp handoff on the client still works end-to-end.
 */

// Naive in-memory rate limit — one instance, best-effort. Real protection
// comes from Supabase RLS + the honeypot; this just blunts rapid abuse.
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

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order." },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled → silently accept without recording (don't tip off bots).
  if (data.company) {
    return NextResponse.json({ ok: true, id: null });
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.priceRwf * item.quantity,
    0,
  );
  const threshold = await getFreeDeliveryThreshold();
  const deliveryFree =
    data.fulfillment === "pickup" || subtotal >= threshold;

  const supabase = getServiceClient();
  if (!supabase) {
    // Seed mode — no database. Accept so the flow completes locally.
    return NextResponse.json({ ok: true, id: null, mode: "seed" });
  }

  const { data: inserted, error } = await supabase
    .from("ou_orders")
    .insert({
      customer_name: data.customerName,
      phone: data.phone,
      fulfillment: data.fulfillment,
      delivery_area: data.fulfillment === "delivery" ? data.deliveryArea : null,
      note: data.note,
      items: data.items,
      subtotal_rwf: subtotal,
      delivery_free: deliveryFree,
      total_rwf: subtotal,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "We couldn't save your order. Please try WhatsApp instead." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
