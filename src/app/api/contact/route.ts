import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/errors";

/**
 * Saves a contact-form message. Zod-validated, honeypot-guarded, lightly
 * rate-limited, inserted with the service-role key past RLS. Degrades
 * gracefully if the table hasn't been created yet.
 */

const messageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z.string().trim().max(20).nullable(),
  message: z.string().trim().min(2, "Please enter a message").max(2000),
  company: z.string().max(0).optional().or(z.literal("")),
});

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
      { error: "Too many messages. Please try again in a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 422 },
    );
  }
  const data = parsed.data;

  if (data.company) return NextResponse.json({ ok: true });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: "seed" });

  const { error } = await supabase.from("ou_messages").insert({
    name: data.name,
    phone: data.phone || null,
    message: data.message,
    status: "new",
  });

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ ok: true, mode: "pending-migration" });
    }
    return NextResponse.json(
      { error: "We couldn't send your message. Please try WhatsApp instead." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
