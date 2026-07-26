import { NextResponse } from "next/server";
import { leadInputSchema } from "@/lib/leadSchema";
import { getServiceClient } from "@/lib/supabase/admin";

/**
 * Records a B2B / wholesale trade enquiry. Mirrors the order route: Zod
 * validation, a honeypot, and a light rate limit. Inserts with the service-role
 * key past RLS. Degrades gracefully if the leads table hasn't been created yet
 * so the client's WhatsApp handoff still completes.
 */

const RATE_LIMIT = 6;
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

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid enquiry." },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot filled → silently accept.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "seed" });
  }

  const { error } = await supabase.from("ou_leads").insert({
    business_name: data.businessName,
    contact_name: data.contactName,
    phone: data.phone,
    business_type: data.businessType,
    message: data.message,
    status: "new",
  });

  if (error) {
    // 42P01 = table not created yet. Don't block the WhatsApp handoff.
    if (error.code === "42P01") {
      return NextResponse.json({ ok: true, mode: "pending-migration" });
    }
    return NextResponse.json(
      { error: "We couldn't save your enquiry. Please try WhatsApp instead." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
